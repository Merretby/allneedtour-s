import { useEffect, useRef, useState } from "react";

export interface ManagedCategory {
  name: string;
  slug: string;
  subcategories: { name: string; items: string[] }[];
}

const STORAGE_KEY = "allneed-managed-categories";
const CHANGE_EVENT = "allneed-categories-changed";

function readCategories(fallback: ManagedCategory[]) {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      if (fallback.length > 0) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      }
      return fallback;
    }
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as ManagedCategory[]) : fallback;
  } catch {
    return fallback;
  }
}

export function useManagedCategories(fallback: ManagedCategory[]) {
  const fallbackRef = useRef(fallback);
  const [categories, setCategories] = useState(() =>
    readCategories(fallbackRef.current)
  );

  useEffect(() => {
    const refresh = () => setCategories(readCategories(fallbackRef.current));
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const save = (next: ManagedCategory[]) => {
    setCategories(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return {
    categories,
    addCategory: (path: string) => {
      const parts = path.split("/").map((part) => part.trim()).filter(Boolean);
      if (parts.length === 0) return;
      const [parentName, ...children] = parts;
      const parentSlug = parentName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const next = categories.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) => ({
          ...subcategory,
          items: [...subcategory.items],
        })),
      }));
      let parent = next.find((category) => category.name === parentName);
      if (!parent) {
        parent = { name: parentName, slug: parentSlug, subcategories: [] };
        next.push(parent);
      }
      if (children.length > 0) {
        const childName = children[0];
        const child = parent.subcategories.find((item) => item.name === childName);
        if (!child) parent.subcategories.push({ name: childName, items: children.slice(1) });
        else child.items = [...new Set([...child.items, ...children.slice(1)])];
      }
      save(next);
    },
    removeCategory: (path: string) => {
      const parts = path.split("/").map((part) => part.trim()).filter(Boolean);
      const [parentName, childName, itemName] = parts;
      const next = categories
        .map((category) => {
          if (category.name !== parentName) return category;
          if (!childName) return null;
          return {
            ...category,
            subcategories: category.subcategories
              .map((subcategory) => {
                if (subcategory.name !== childName) return subcategory;
                return { ...subcategory, items: itemName ? subcategory.items.filter((item) => item !== itemName) : [] };
              })
              .filter((subcategory) => subcategory.name !== childName || itemName !== undefined),
          };
        })
        .filter((category): category is ManagedCategory => category !== null)
        .filter((category) => category.subcategories.length > 0 || category.name !== parentName);
      save(next);
    },
  };
}

export function flattenCategoryPaths(categories: ManagedCategory[]) {
  return categories.flatMap((category) => [
    category.name,
    ...category.subcategories.flatMap((subcategory) => [
      `${category.name}/${subcategory.name}`,
      ...subcategory.items.map((item) => `${category.name}/${subcategory.name}/${item}`),
    ]),
  ]);
}
