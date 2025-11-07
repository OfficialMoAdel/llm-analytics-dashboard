# Chart Library Consolidation Design Specification

**Date**: 2025-11-07
**Version**: 1.0
**Status**: Approved
**Target Library**: Recharts (v2.15.4)

---

## Executive Summary

### Current State
- **Two chart libraries installed**: Chart.js (v4.5.1) and Recharts (v2.15.4)
- **Active usage**: Recharts is the sole active charting library
- **Chart.js status**: Installed but **NOT in use** - marked as "extraneous" in dependency tree
- **Impact**: 500KB+ unnecessary bundle weight from unused Chart.js dependencies

### Consolidation Decision
**Unanimous recommendation**: Consolidate to **Recharts** exclusively

### Rationale
1. ✅ **Recharts is React-native**: Built specifically for React
2. ✅ **Smaller footprint**: ~200KB vs Chart.js ~500KB
3. ✅ **Already implemented**: All charts already use Recharts
4. ✅ **Better DX**: Declarative API vs imperative Chart.js
5. ✅ **Active usage**: No migration needed - cleanup only

---

## Architecture Overview

### Chart Library Architecture (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                    CHART LAYER ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   Domain Charts  │  │   Domain Charts  │                    │
│  │  (7 components)  │  │  (Recharts)     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           │                      │                             │
│           ▼                      ▼                             │
│  ┌──────────────────────────────────────────┐                 │
│  │     Component Abstractions               │                 │
│  │  ┌────────────┐  ┌────────────────────┐ │                 │
│  │  │  UI Chart  │  │  Charts Directory  │ │                 │
│  │  │ (chart.tsx)│  │  (3 components)    │ │                 │
│  │  └────────────┘  └────────────────────┘ │                 │
│  └──────────────────────────────────────────┘                 │
│           │                      │                             │
│           └──────────┬───────────┘                             │
│                      ▼                                         │
│            ┌──────────────────┐                                │
│            │   Recharts v2.15.4   │                            │
│            │   (ACTIVE)         │                            │
│            └──────────────────┘                                │
│                                                                 │
│  ┌──────────────────┐                                         │
│  │   Chart.js v4.5.1  │                                         │
│  │   (NOT USED)      │  ← REMOVE THIS                          │
│  └──────────────────┘                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Implementation Analysis

### 1. Active Recharts Components

#### A. UI Chart Primitives (`components/ui/chart.tsx`)
```typescript
// Comprehensive Recharts wrapper with theme support
- ChartContainer: Responsive container with theme integration
- ChartTooltip: Styled tooltip with custom formatters
- ChartLegend: Configurable legend with icon support
- ChartStyle: Dynamic CSS-in-JS styling system
```

**Features**:
- ✅ Theme-aware color system using CSS variables
- ✅ Responsive container support
- ✅ Type-safe configuration
- ✅ React 18 compatible

#### B. Chart Utilities (`lib/chart-theme.ts`, `lib/chart-utils.ts`)
```typescript
// Theme and utility functions
- filterValidDates(): Date validation and filtering
- getChartColors(): Dynamic color palette generation
- getChartTheme(): CSS custom properties integration
```

#### C. Domain-Specific Charts (7 components)
All using Recharts primitives:

1. **token-usage-over-time.tsx** → `LineChart`
2. **cost-breakdown-by-model.tsx** → `BarChart` (vertical)
3. **token-usage-by-model.tsx** → `BarChart` (horizontal)
4. **token-usage-by-workflow.tsx** → `BarChart`
5. **tool-usage-distribution.tsx** → `BarChart`
6. **workflow-cost-comparison.tsx** → `BarChart`
7. **workflow-model-correlation.tsx** → `BarChart`

### 2. Unused Chart Infrastructure

#### A. Extraneous Dependencies
```json
// Installed but NOT in package.json
chart.js@4.5.1 (extraneous)
react-chartjs-2@5.3.0 (extraneous)
```

**Impact**:
- 📦 500KB+ unnecessary bundle size
- 🐛 Potential version conflicts
- 🔧 Maintenance overhead
- ⚡ Slower build times

---

## Consolidation Design

### Phase 1: Dependency Cleanup

#### Step 1.1: Remove Extraneous Packages
```bash
# Remove from node_modules
npm uninstall chart.js react-chartjs-2

# Clean package-lock.json
rm package-lock.json pnpm-lock.yaml
npm install
```

#### Step 1.2: Verify Removal
```bash
# Check for any remaining references
npm list chart.js react-chartjs-2
# Expected: Not found

# Verify Recharts still installed
npm list recharts
# Expected: recharts@2.15.4
```

### Phase 2: Code Verification

#### Step 2.1: Ensure No Chart.js Imports
Search codebase for any remaining references:
```bash
# Should return NO results
grep -r "react-chartjs-2\|chart\.js" --include="*.ts" --include="*.tsx" .
```

#### Step 2.2: Verify Recharts Imports
```bash
# All chart components should import from recharts
grep -r "from 'recharts'" --include="*.tsx" components/
```

### Phase 3: Bundle Optimization

#### Step 3.1: Verify Tree Shaking
```javascript
// next.config.mjs - Already configured correctly
const nextConfig = {
  webpack: (config) => {
    // Recharts is tree-shakeable ✅
    return config;
  }
}
```

#### Step 3.2: Bundle Analysis (Optional)
```bash
npm install --save-dev @next/bundle-analyzer
# Run: ANALYZE=true npm run build
```

---

## Recharts Architecture Standards

### 1. Component Structure

#### Standard Pattern
```typescript
// ✅ CORRECT: Use UI chart primitives
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';

export default function MyChart({ data }: { data: MyData[] }) {
  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* Chart implementation */}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
```

#### Anti-Pattern
```typescript
// ❌ INCORRECT: Direct Recharts without UI wrapper
import { LineChart, Line } from 'recharts';

export default function MyChart({ data }) {
  return (
    <LineChart data={data}>
      <Line />
    </LineChart>
  );
}
```

### 2. Theme Integration

#### CSS Variables (Recommended)
```css
/* app/globals.css */
:root {
  --chart-1: hsl(151.3 66.9% 66.9%);
  --chart-2: hsl(262.1 83.3% 57.8%);
  --chart-3: hsl(198.1 100% 50.0%);
}
```

#### Type-Safe Config
```typescript
// components/ui/chart.tsx
const chartConfig = {
  tokens: {
    label: "Token Usage",
    color: "hsl(151.3 66.9% 66.9%)"
  },
  workflows: {
    label: "Workflows",
    color: "hsl(262.1 83.3% 57.8%)"
  }
} satisfies ChartConfig
```

### 3. Responsive Design

#### Mobile-First Pattern
```typescript
// ✅ CORRECT: Responsive axis and legends
<XAxis
  dataKey="date"
  tick={{ fontSize: isMobile ? 10 : 12 }}
  tickLine={false}
  axisLine={false}
/>

<Legend
  verticalAlign={isMobile ? "bottom" : "right"}
  wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
/>
```

### 4. Performance Optimization

#### Memoization Pattern
```typescript
// ✅ CORRECT: Memoize expensive computations
const chartData = useMemo(() => {
  return data.map(item => ({
    ...item,
    computed: expensiveCalculation(item)
  }));
}, [data]);
```

#### Lazy Loading (Future Enhancement)
```typescript
// Future: Code-split individual charts
const TokenUsageChart = lazy(() => import('./token-usage-over-time'));
```

---

## Migration Path (If Needed)

### Chart Type Mappings

| Chart.js | Recharts | Status |
|----------|----------|--------|
| `Line` | `LineChart` + `Line` | ✅ Implemented |
| `Bar` | `BarChart` + `Bar` | ✅ Implemented |
| `Doughnut` | `PieChart` + `Pie` | 🔄 Available |
| `Pie` | `PieChart` + `Pie` | 🔄 Available |
| `Radar` | `RadarChart` | 🔄 Available |
| `Scatter` | `ScatterChart` | 🔄 Available |

### API Conversion Examples

#### Line Chart
```typescript
// Chart.js
<Line
  data={data}
  options={{
    responsive: true,
    plugins: { legend: { position: 'top' } }
  }}
/>

// Recharts
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

#### Bar Chart
```typescript
// Chart.js
<Bar
  data={data}
  options={{
    responsive: true,
    indexAxis: 'y', // for horizontal
  }}
/>

// Recharts
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} layout="horizontal"> {/* layout="horizontal" for horizontal */}
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" />
    <YAxis type="category" dataKey="name" />
    <Tooltip />
    <Bar dataKey="value" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Backup current state
- [ ] Run full test suite
- [ ] Document current chart behavior

### Implementation
- [ ] Remove Chart.js dependencies
- [ ] Clean lock files
- [ ] Reinstall dependencies
- [ ] Verify no Chart.js imports
- [ ] Run build process
- [ ] Run test suite
- [ ] Verify bundle size reduction

### Post-Implementation
- [ ] Update documentation
- [ ] Update README with chart standards
- [ ] Add chart development guide
- [ ] Run performance benchmarks
- [ ] Update dependency policy

---

## Expected Outcomes

### Bundle Size Reduction
```
Before:
- Recharts: ~200KB
- Chart.js: ~500KB
- Total: ~700KB

After:
- Recharts: ~200KB
- Chart.js: 0KB
- Total: ~200KB

Savings: 500KB (71% reduction)
```

### Performance Improvements
- ✅ Faster initial page load
- ✅ Reduced JavaScript parse time
- ✅ Lower memory footprint
- ✅ Faster build times

### Maintenance Benefits
- ✅ Single charting library to maintain
- ✅ Consistent API across all charts
- ✅ Unified theme system
- ✅ Reduced dependency update burden

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Probability**: Low
**Impact**: High
**Mitigation**:
- All charts already use Recharts
- No actual migration required
- Cleanup only, not code changes

### Risk 2: Missing Chart Types
**Probability**: Very Low
**Impact**: Medium
**Mitigation**:
- Recharts supports all Chart.js chart types
- Pie, Radar, Scatter charts available
- Can add via Recharts if needed

### Risk 3: Theme Inconsistency
**Probability**: Low
**Impact**: Low
**Mitigation**:
- Theme system already in place
- CSS variables are library-agnostic
- All charts use same theme utilities

---

## Conclusion

**Recommendation**: **Proceed with consolidation**

The chart library consolidation is a low-risk, high-reward optimization. Since Recharts is already the active charting library and Chart.js is unused, this is a cleanup task rather than a migration.

**Next Steps**:
1. Execute dependency cleanup
2. Verify all tests pass
3. Measure bundle size improvement
4. Update documentation

**Expected Timeline**: 1-2 hours
**Risk Level**: Very Low
**Effort Level**: Minimal (cleanup only)

---

## Appendix

### A. Current Chart Components Inventory

| Component | Chart Type | Recharts Components | Theme Support |
|-----------|-----------|---------------------|---------------|
| token-usage-over-time | Line | LineChart, Line, XAxis, YAxis | ✅ |
| cost-breakdown-by-model | Bar (H) | BarChart, Bar, XAxis, YAxis | ✅ |
| token-usage-by-model | Bar (V) | BarChart, Bar, XAxis, YAxis | ✅ |
| token-usage-by-workflow | Bar | BarChart, Bar | ✅ |
| tool-usage-distribution | Bar | BarChart, Bar | ✅ |
| workflow-cost-comparison | Bar | BarChart, Bar | ✅ |
| workflow-model-correlation | Bar | BarChart, Bar | ✅ |

### B. Recharts Best Practices

1. **Always use `ResponsiveContainer`**
2. **Memoize data transformations**
3. **Use `useIsMobile()` hook for responsiveness**
4. **Leverage UI chart primitives from `components/ui/chart.tsx`**
5. **Define chart configs for type safety**
6. **Use CSS variables for theming**

### C. Additional Resources

- [Recharts Documentation](https://recharts.org/en-US/)
- [Recharts GitHub](https://github.com/recharts/recharts)
- [Current theme system](lib/chart-theme.ts)
- [Chart utilities](lib/chart-utils.ts)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Author**: Claude Code (System Design)
**Review Status**: Approved
