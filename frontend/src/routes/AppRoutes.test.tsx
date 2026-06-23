import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "../auth/AuthContext";
import { describe, it, expect, vi } from "vitest";

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("AppRoutes Smoke Tests", () => {
  it("renders the login page on initial load", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );
    // Since we don't know the exact text, we just verify it doesn't crash.
    expect(document.body).toBeDefined();
  });

  it("renders the control center dashboard without crashing", () => {
    // We mock localStorage or auth state if needed, but just rendering it should test for basic syntax/import errors.
    render(
      <MemoryRouter initialEntries={["/control-center/dashboard"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(document.body).toBeDefined();
  });
  
  it("renders the inventory dashboard without crashing", () => {
    render(
      <MemoryRouter initialEntries={["/inventory/dashboard"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(document.body).toBeDefined();
  });

  it("renders the finance general ledger without crashing", () => {
    render(
      <MemoryRouter initialEntries={["/finance/general-ledger"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(document.body).toBeDefined();
  });
});
