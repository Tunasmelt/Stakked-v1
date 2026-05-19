# Graph Report - src  (2026-05-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 312 nodes · 660 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8d0b7ba2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `compileProjectToHtml()` - 13 edges
2. `searchAssets()` - 12 edges
3. `saveProject()` - 11 edges
4. `NumberInput()` - 10 edges
5. `getAnimationCSS()` - 9 edges
6. `initDB()` - 8 edges
7. `POST()` - 7 edges
8. `onUpdate()` - 7 edges
9. `renderContent()` - 7 edges
10. `listAvailableProviders()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `handleExportHtml()` --calls--> `compileProjectToHtml()`  [INFERRED]
  components/system/CommandPalette.tsx → lib/export.ts
- `POST()` --calls--> `compileProjectToHtml()`  [INFERRED]
  app/api/ai/theme/route.ts → lib/export.ts
- `handleCreateNew()` --calls--> `saveProject()`  [INFERRED]
  app/workspace/page.tsx → lib/db.ts
- `handleCreateFromTemplate()` --calls--> `saveProject()`  [INFERRED]
  app/workspace/page.tsx → lib/db.ts
- `fetchAssets()` --calls--> `searchAssets()`  [INFERRED]
  components/editor/AssetPanel.tsx → lib/asset-resolver.ts

## Communities (15 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (30): generateRemixProject(), handleRemix(), cacheAsset(), deleteProject(), evictLRUAssets(), getCachedAsset(), getStorageEstimate(), initDB() (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (6): BorderSection(), addShadow(), removeShadow(), updateShadow(), onUpdate(), NumberInput()

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (3): ButtonElement(), ShapeElement(), detectPlatform()

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (18): buildWrapperStyle(), defaultAnimation(), directionalOffset(), easingFor(), getAnimationCSS(), getMotionProps(), getMotionTriggerProps(), injectAnimationStyle() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (18): applyPreviewToCanvas(), handleGenerate(), GET(), AIProviderError, generateJSON(), generateOpenAICompatible(), generateWithGemini(), generateWithGroq() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (6): handleExport(), cloneWithStyles(), downloadBlob(), downloadNodeAsImage(), exportNodeAsImage(), walkAndInlineStyles()

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (13): fetchAssets(), handleSelect(), fetchIcons(), fetchImages(), hydrateFromCache(), searchAssets(), searchBundledColors(), searchBundledFonts() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (9): addVariable(), removeVariable(), updateSettings(), updateVariable(), handleExportHtml(), GlobalModals(), handleKeyDown(), handleSave() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.3
Nodes (14): buildBoxStyleInline(), buildTypographyInline(), compileProjectToHtml(), escapeAttr(), escapeHtml(), minimalErrorHtml(), renderContent(), renderElement() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): applyTokensToRoot(), createCustomTheme(), fetchTheme(), getThemeTokens(), loadTheme(), toggleDarkMode()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `compileProjectToHtml()` connect `Community 9` to `Community 8`, `Community 3`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `compileProjectToHtml()` (e.g. with `POST()` and `handleExport()`) actually correct?**
  _`compileProjectToHtml()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `saveProject()` (e.g. with `handleRemix()` and `load()`) actually correct?**
  _`saveProject()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `getAnimationCSS()` (e.g. with `handleTest()` and `renderElement()`) actually correct?**
  _`getAnimationCSS()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._