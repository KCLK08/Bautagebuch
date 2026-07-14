import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';

import { colors } from '@/theme/colors';
import { ui } from '@/theme/ui';

interface PdfPreviewPaneProps {
  fileUri: string | null;
  loading?: boolean;
  error?: string;
  title?: string;
  onRefresh?: () => void;
  compact?: boolean;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function buildPreviewHtml(fileUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0, user-scalable=yes" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; height: 100%; background: #e8edf2; }
      body { display: flex; flex-direction: column; }
      .toolbar {
        background: #12534b;
        color: #fff;
        font: 600 13px/1.2 -apple-system, BlinkMacSystemFont, sans-serif;
        padding: 10px 12px;
        text-align: center;
      }
      .frame { flex: 1; min-height: 0; }
      embed, iframe, object { width: 100%; height: 100%; border: 0; background: #fff; }
    </style>
  </head>
  <body>
    <div class="toolbar">PDF-Vorschau · Pinch zum Zoomen</div>
    <div class="frame">
      <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
    </div>
  </body>
</html>`;
}

export function PdfPreviewPane({
  fileUri,
  loading = false,
  error = '',
  title = 'PDF-Vorschau',
  onRefresh,
  compact = false,
}: PdfPreviewPaneProps) {
  const [html, setHtml] = useState<string>('');
  const [htmlError, setHtmlError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadHtml() {
      if (!fileUri) {
        setHtml('');
        setHtmlError('');
        return;
      }
      try {
        setHtmlError('');
        const nextHtml = await buildPreviewHtml(fileUri);
        if (!cancelled) setHtml(nextHtml);
      } catch (e) {
        if (!cancelled) {
          setHtml('');
          setHtmlError((e as Error).message || 'Vorschau konnte nicht geladen werden.');
        }
      }
    }
    loadHtml();
    return () => {
      cancelled = true;
    };
  }, [fileUri]);

  const webSource = useMemo(() => {
    if (html) return { html };
    if (fileUri && Platform.OS !== 'web') return { uri: fileUri };
    return undefined;
  }, [fileUri, html]);

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compact]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>PDF-Vorschau wird erstellt…</Text>
        </View>
      </View>
    );
  }

  if (error || htmlError) {
    return (
      <View style={[styles.container, compact && styles.compact]}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Vorschau nicht verfügbar</Text>
          <Text style={styles.errorText}>{error || htmlError}</Text>
          {onRefresh ? (
            <Pressable style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Erneut versuchen</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  if (!fileUri || !webSource) {
    return (
      <View style={[styles.container, compact && styles.compact]}>
        <View style={styles.centered}>
          <Text style={styles.placeholderTitle}>{title}</Text>
          <Text style={styles.placeholderText}>Die Vorschau wird automatisch aus Ihren Eingaben erzeugt.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerHint}>Live-Ansicht des ausgefüllten BTB</Text>
        </View>
        {onRefresh ? (
          <Pressable style={styles.refreshChip} onPress={onRefresh}>
            <Text style={styles.refreshChipText}>Aktualisieren</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.viewer}>
        <WebView
          key={fileUri}
          originWhitelist={['*']}
          source={webSource}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
        />
      </View>
    </View>
  );
}

export async function previewBytesToDataUri(bytes: Uint8Array): Promise<string> {
  return `data:application/pdf;base64,${bytesToBase64(bytes)}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
    ...ui.shadow.card,
  },
  compact: {
    minHeight: 280,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ui.spacing.md,
    paddingVertical: ui.spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  headerHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  refreshChip: {
    backgroundColor: '#e8f4f2',
    borderRadius: ui.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  viewer: {
    flex: 1,
    minHeight: 280,
  },
  webview: {
    backgroundColor: '#e8edf2',
    flex: 1,
  },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: ui.spacing.lg,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: ui.radius.sm,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
