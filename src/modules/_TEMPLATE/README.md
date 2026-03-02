# Module Generator Template

This template generates a new feature module following the established blueprint.

## Usage

```bash
# Copy this template
cp -r modules/_template modules/[feature-name]

# Replace all occurrences of:
# - [Feature] → Schedule, Technician, etc.
# - [feature] → schedule, technician, etc.
```

## File Templates

### types.ts

```ts
export type [Feature]Status = "active" | "inactive" | "pending";

export interface [Feature] {
  id: string;
  companyId: string;
  name: string;
  status: [Feature]Status;
  createdAt: string;
  updatedAt: string;
}

export interface [Feature]QueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sort?: string;
}

export interface [Feature]Response {
  data: [Feature][];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### api.ts

```ts
import type { [Feature], [Feature]Response, [Feature]QueryParams } from "./types";
import { addAuditLog, getEntityAuditLogs } from "@/modules/audit/api";
import { getChanges } from "@/utils/diff";

const mockData: [Feature][] = [];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const [feature]Api = {
  async get[Feature]s(params: [Feature]QueryParams, companyId: string): Promise<[Feature]Response> {
    await delay(300);
    // Implement filtering, sorting, pagination
    return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 };
  },

  async get[Feature]ById(id: string, companyId: string): Promise<[Feature] | null> {
    await delay(200);
    return null;
  },

  async create[Feature](data: Partial<[Feature]>, userId: string, userName: string) {
    await delay(500);
    // Create and audit
    return {} as [Feature];
  },

  async update[Feature](id: string, updates: Partial<[Feature]>, userId: string, userName: string, companyId: string) {
    await delay(500);
    // Update and audit
    return {} as [Feature];
  },

  async delete[Feature](id: string, companyId: string) {
    await delay(500);
    // Delete and audit
  },

  async getAuditLogs(entityId: string): Promise<AuditLog[]> {
    await delay(100);
    return getEntityAuditLogs("[feature]", entityId);
  },
};
```

### hooks.ts

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { [feature]Api } from "./api";
import type { [Feature], [Feature]QueryParams } from "./types";
import { useUser } from "@/shared/UserContext";

export const [feature]Keys = {
  all: ["[feature]"] as const,
  lists: () => [...[feature]Keys.all, "list"] as const,
  list: (params: [Feature]QueryParams) => [...[feature]Keys.lists(), params] as const,
  details: () => [...[feature]Keys.all, "detail"] as const,
  detail: (id: string) => [...[feature]Keys.details(), id] as const,
};

export function use[Feature]List(params: [Feature]QueryParams) {
  const { user } = useUser();
  return useQuery({
    queryKey: [feature]Keys.list(params),
    queryFn: () => [feature]Api.get[Feature]s(params, user?.companyId ?? ""),
    staleTime: 1000 * 60 * 5,
  });
}

export function use[Feature]ById(id: string | null) {
  const { user } = useUser();
  return useQuery({
    queryKey: [feature]Keys.detail(id!),
    queryFn: () => [feature]Api.get[Feature]ById(id!, user?.companyId ?? ""),
    enabled: !!id,
  });
}

export function useUpdate[Feature]() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<[Feature]> }) =>
      [feature]Api.update[Feature](id, updates, user!.id, user!.name, user!.companyId),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [feature]Keys.lists() });
      await queryClient.cancelQueries({ queryKey: [feature]Keys.detail(id) });

      const previousLists = new Map();
      let previousDetail: [Feature] | null = null;

      // Snapshot and update lists
      const lists = queryClient.getQueriesData({ queryKey: [feature]Keys.lists() });
      lists.forEach(([key, data]: any) => {
        if (data?.data) {
          previousLists.set(String(key), data.data);
          queryClient.setQueryData(key, {
            ...data,
            data: data.data.map((item: [Feature]) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          });
        }
      });

      // Snapshot and update detail
      const detailKey = [feature]Keys.detail(id);
      const prev = queryClient.getQueryData(detailKey);
      if (prev) {
        previousDetail = prev as [Feature];
        queryClient.setQueryData(detailKey, { ...prev, ...updates });
      }

      return { previousLists, previousDetail };
    },
    onError: (_err, _vars, context) => {
      context?.previousLists.forEach((data, key) => {
        queryClient.setQueriesData({ queryKey: [feature]Keys.lists() }, () => ({ data }));
      });
      if (context?.previousDetail) {
        queryClient.setQueryData([feature]Keys.detail(_vars.id), context.previousDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [feature]Keys.lists() });
      queryClient.invalidateQueries({ queryKey: [feature]Keys.details() });
    },
  });
}
```

### permissions.ts

```ts
import type { Role } from "@/modules/auth/types";

export const permissions = {
  [feature]: {
    view: ["admin", "supervisor", "technician"] as Role[],
    edit: ["admin", "supervisor"] as Role[],
    delete: ["admin"] as Role[],
    viewAudit: ["admin", "supervisor"] as Role[],
  },
};

export function can(role: Role, action: string): boolean {
  return permissions[feature][action]?.includes(role) ?? false;
}
```

## Component Templates

### [Feature]Table.tsx

```tsx
import type { [Feature] } from "@/modules/[feature]/types";

type Props = {
  data: [Feature][];
  selectedId: string | null;
  openId?: string | null;
  onRowClick: (item: [Feature]) => void;
  isFetching?: boolean;
  savingId?: string | null;
};

export default function [Feature]Table({
  data,
  selectedId,
  openId,
  onRowClick,
  isFetching,
  savingId,
}: Props) {
  // Same pattern as AttendanceTable
}
```

### [Feature]Drawer.tsx

```tsx
type Props = {
  selected[Feature]: [Feature] | null;
  mode: "view" | "edit";
  onClose: () => void;
  onEdit: () => void;
  onSave: (updated: [Feature]) => void;
  notFound?: boolean;
};

export default function [Feature]Drawer({
  selected[Feature],
  mode,
  onClose,
  onEdit,
  onSave,
  notFound,
}: Props) {
  // Same pattern as AttendanceDrawer
}
```

## Page Template

### [Feature]Page.tsx

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { use[Feature]List, use[Feature]ById, useUpdate[Feature] } from "@/modules/[feature]/hooks";
import { useUser } from "@/shared/UserContext";

interface Props {
  initialPage?: number;
  initialOpenId?: string | null;
}

export default function [Feature]Page({ initialPage = 1, initialOpenId }: Props) {
  const navigate = useNavigate();
  const { user, canEdit } = useUser();

  const [params, setParams] = useState({ page: initialPage, limit: 10 });
  const { data, isFetching } = use[Feature]List(params);
  const { data: detail } = use[Feature]ById(initialOpenId);
  const updateMutation = useUpdate[Feature]();

  const [selected, setSelected] = useState<[Feature] | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (detail) {
      setSelected(detail);
      setMode("view");
    }
  }, [detail]);

  const handleClose = () => {
    setSelected(null);
    navigate({ search: { open: undefined } });
  };

  return (
    // Same pattern as AttendancePage
  );
}
```

## Route Template

### [feature].tsx

```tsx
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import [Feature]Page from "@/pages/[Feature]Page";
import { z } from "zod";

const searchParams = z.object({
  page: z.coerce.number().default(1),
  search: z.string().default(""),
  status: z.string().default(""),
  sort: z.string().default("name_desc"),
  open: z.string().optional(),
});

export const Route = createFileRoute("/[feature]")({
  validateSearch: searchParams,
  component: RouteComponent,
});

function RouteComponent() {
  const search = useSearch({ from: "/[feature]" });
  const navigate = useNavigate();

  const setSearch = (params: Partial<z.infer<typeof searchParams>>) => {
    navigate({ to: "/[feature]", search: (prev) => ({ ...prev, ...params }) });
  };

  return (
    <[Feature]Page
      initialPage={search.page}
      initialOpenId={search.open}
      onParamsChange={setSearch}
    />
  );
}
```

## Quick Start Checklist

For each new module:

1. [ ] Copy template files
2. [ ] Replace `[Feature]` and `[feature]` placeholders
3. [ ] Define entity-specific types
4. [ ] Implement API methods
5. [ ] Adjust permissions
6. [ ] Create table/drawer/form components
7. [ ] Add route
8. [ ] Test deep-linking
9. [ ] Test optimistic updates
10. [ ] Test rollback on error
