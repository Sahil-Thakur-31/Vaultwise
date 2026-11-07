import React from "react";

export type ContextMenuItemAction = {
  type?: "item";
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  badge?: string;
  onClick?: () => void;
  submenu?: ContextMenuEntry[];
};

export type ContextMenuItemDivider = {
  type: "divider";
  id?: string;
  label?: string;
};

export type ContextMenuEntry = ContextMenuItemAction | ContextMenuItemDivider;

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  title?: string;
  subtitle?: string;
  items: ContextMenuEntry[];
}

