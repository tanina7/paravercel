export type PermissionDefinition = {
  key: string;
  label: string;
  description: string;
  group: 'Administracion' | 'Tramites' | 'Perfil';
};

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  {
    key: 'admin.panel.access',
    label: 'Acceder al panel administrativo',
    description: 'Permite abrir las rutas y vistas administrativas.',
    group: 'Administracion',
  },
  {
    key: 'admin.dashboard.view',
    label: 'Ver dashboard administrativo',
    description: 'Permite ver metricas y resumen operativo.',
    group: 'Administracion',
  },
  {
    key: 'admin.users.manage',
    label: 'Gestionar usuarios',
    description: 'Crear, editar, activar o desactivar usuarios.',
    group: 'Administracion',
  },
  {
    key: 'admin.roles.manage',
    label: 'Gestionar roles y permisos',
    description: 'Editar nombres, descripciones y permisos de roles.',
    group: 'Administracion',
  },
  {
    key: 'requests.create',
    label: 'Crear tramites',
    description: 'Permite registrar una nueva solicitud de tramite.',
    group: 'Tramites',
  },
  {
    key: 'requests.history.view',
    label: 'Ver historial de tramites',
    description: 'Permite consultar solicitudes registradas.',
    group: 'Tramites',
  },
  {
    key: 'requests.review',
    label: 'Revisar tramites',
    description: 'Permite gestionar solicitudes en proceso.',
    group: 'Tramites',
  },
  {
    key: 'requests.approve',
    label: 'Aprobar tramites',
    description: 'Permite aprobar o rechazar solicitudes.',
    group: 'Tramites',
  },
  {
    key: 'profile.view',
    label: 'Ver perfil',
    description: 'Permite acceder al perfil personal.',
    group: 'Perfil',
  },
  {
    key: 'profile.update',
    label: 'Actualizar perfil',
    description: 'Permite actualizar datos del perfil.',
    group: 'Perfil',
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map((permission) => permission.key);

const DEFAULT_ROLE_PERMISSION_MAP: Record<number, string[]> = {
  1: [...ALL_PERMISSION_KEYS],
  2: [
    'admin.panel.access',
    'admin.dashboard.view',
    'requests.history.view',
    'requests.review',
    'requests.approve',
    'profile.view',
    'profile.update',
  ],
  3: ['requests.history.view', 'profile.view', 'profile.update'],
  4: ['requests.history.view', 'requests.review', 'profile.view', 'profile.update'],
  5: ['requests.history.view', 'requests.review', 'requests.approve', 'profile.view', 'profile.update'],
  6: ['requests.history.view', 'requests.review', 'requests.approve', 'profile.view', 'profile.update'],
  7: ['requests.history.view', 'requests.review', 'requests.approve', 'profile.view', 'profile.update'],
  8: ['requests.create', 'requests.history.view', 'profile.view', 'profile.update'],
  9: ['requests.create', 'requests.history.view', 'profile.view', 'profile.update'],
  10: ['admin.panel.access', 'admin.dashboard.view', 'requests.history.view', 'requests.review', 'profile.view', 'profile.update'],
  11: ['admin.panel.access', 'admin.dashboard.view', 'requests.history.view', 'requests.review', 'profile.view', 'profile.update'],
  12: ['admin.panel.access', 'admin.dashboard.view', 'requests.history.view', 'requests.review', 'requests.approve', 'profile.view', 'profile.update'],
};

export function getDefaultPermissionsForRole(roleId: number): string[] {
  return [...(DEFAULT_ROLE_PERMISSION_MAP[Number(roleId)] || ['profile.view'])];
}

export function normalizePermissions(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((p) => {
        if (typeof p === 'object' && p !== null && 'permission_key' in p) {
          return String((p as any).permission_key || '').trim();
        }
        return String(p || '').trim();
      })
      .filter(Boolean);
  }
  return [];
}

export function resolveEffectivePermissions(roleId: number, permissions: unknown): string[] {
  const normalized = normalizePermissions(permissions);
  if (normalized.length > 0) {
    return normalized;
  }
  return getDefaultPermissionsForRole(roleId);
}

export function hasSessionPermission(session: { role_id: number; permissions: string[] }, permission: string): boolean {
  if (!session) {
    return false;
  }

  const permissions = resolveEffectivePermissions(Number(session.role_id ?? 0), session.permissions);
  return permissions.includes(permission);
}
