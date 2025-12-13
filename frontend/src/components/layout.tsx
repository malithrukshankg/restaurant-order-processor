import { AppHeader } from "./AppHeader";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}