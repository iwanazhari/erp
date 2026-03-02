# Module Blueprint Pattern

This document defines the standard architecture for all feature modules in the ERP system.

## 📁 Standard Module Structure

```
src/
├─ modules/
│   └─ [feature]/
│       ├─ types.ts          # Type definitions
│       ├─ api.ts            # API service layer
│       ├─ hooks.ts          # TanStack Query hooks
│       └─ permissions.ts    # Role-based permissions (optional)
├─ components/
│   └─ [feature]/
│       ├─ [Feature]Table.tsx
│       ├─ [Feature]Drawer.tsx
│       └─ [Feature]Form.tsx
├─ pages/
│   └─ [Feature]Page.tsx
└─ routes/
    └─ [feature].tsx
```

## 🎯 Core Patterns

### 1. Query Key Factory

```ts
export const [feature]Keys = {
  all: ["[feature]"] as const,
  lists: () => [...[feature]Keys.all, "list"] as const,
  list: (params: [Feature]QueryParams) =>
    [...[feature]Keys.lists(), params] as const,
  details: () => [...[feature]Keys.all, "detail"] as const,
  detail: (id: string) => [...[feature]Keys.details(), id] as const,
  summary: () => [...[feature]Keys.all, "summary"] as const,
};
```

### 2. Standard Hooks

#### useListQuery(params)
- Server-side pagination
- Server-side sorting
- Server-side filtering
- Returns: `{ data, isLoading, isFetching }`

#### useDetailQuery(id)
- Fetch by ID (independent of list)
- Enabled only when ID exists
- Returns: `{ data, isLoading }`

#### useCreateMutation()
- Optimistic update for list
- Invalidate on settle
- Returns: `{ mutate, isPending }`

#### useUpdateMutation()
- Optimistic update for list + detail
- Snapshot both caches
- Rollback both on error
- Returns: `{ mutate, isPending }`

#### useDeleteMutation()
- Optimistic removal from list
- Invalidate on settle
- Returns: `{ mutate, isPending }`

### 3. URL-Controlled Drawer Pattern

```ts
// Route schema
const searchParams = z.object({
  open: z.string().optional(),
});

// Page component
const { data: detail } = useDetailQuery(initialOpenId);

useEffect(() => {
  if (detail) {
    setSelected(detail);
    setIsOpen(true);
  }
}, [detail]);

const handleClose = () => {
  setSelected(null);
  navigate({ search: { open: undefined } });
};
```

### 4. Optimistic Sync Pattern

```ts
onMutate: async ({ id, updates }) => {
  // Cancel both
  await queryClient.cancelQueries({ queryKey: keys.lists() });
  await queryClient.cancelQueries({ queryKey: keys.detail(id) });

  // Snapshot both
  const previousLists = snapshotLists();
  const previousDetail = snapshotDetail(id);

  // Update both
  updateLists(id, updates);
  updateDetail(id, updates);

  return { previousLists, previousDetail };
}

onError: (_err, _vars, context) => {
  rollbackLists(context.previousLists);
  rollbackDetail(context.previousDetail);
}
```

### 5. Permission Matrix Pattern

```ts
export const permissions = {
  [feature]: {
    view: ["admin", "supervisor", "technician"],
    edit: ["admin", "supervisor"],
    delete: ["admin"],
    viewAudit: ["admin", "supervisor"],
  },
};

export function can(role, action) {
  return permissions[feature][action]?.includes(role);
}
```

### 6. Audit Integration Pattern

```ts
// In API update function
const changes = getChanges(oldItem, updated);
if (changes.length > 0) {
  await addAuditLog({
    entityType: "[feature]",
    entityId: id,
    action: "update",
    changes,
    userId,
    userName,
    createdAt: new Date().toISOString(),
  });
}
```

## 📋 Module Checklist

When creating a new module, ensure:

- [ ] Types defined (Entity, QueryParams, Response)
- [ ] API layer (CRUD + audit)
- [ ] Query hooks (list + detail)
- [ ] Mutation hooks (create + update + delete)
- [ ] Optimistic sync (list + detail)
- [ ] URL-controlled drawer
- [ ] Permission matrix
- [ ] Audit integration
- [ ] Row highlighting for deep-link
- [ ] Not found handling

## 🚀 Module Replication

To create a new module (e.g., Schedule):

1. Copy `modules/attendance/` → `modules/schedule/`
2. Rename types (Attendance → Schedule)
3. Update API endpoints
4. Adjust permissions
5. Update route path

UI components follow same pattern, minimal changes needed.

## 🧩 Shared Components

These components are reusable across modules:

- `ActivityFeed.tsx` - Dashboard activity feed
- `AuditPanel.tsx` - Audit history display
- `EmptyState.tsx` - Empty/not found state
- `StatusBadge.tsx` - Status indicator
- `QuickStatusEdit.tsx` - Inline status change

## 🎯 Architecture Principles

1. **URL as Source of Truth** - State in URL, not component state
2. **Separate List + Detail** - Independent queries
3. **Optimistic Everything** - Instant UI feedback
4. **Dual Rollback** - List + detail consistency
5. **Permission-Aware UI** - Centralized permissions
6. **Audit by Default** - Every mutation logged
