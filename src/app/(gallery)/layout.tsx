import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import AppTopbar from "@/components/AppTopbar";

export default function GalleryLayout({ children }: { children: React.ReactNode; }) {
  return (
    <SidebarProvider>
      <div className="h-screen w-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
        <div className="col-start-1 col-end-2 row-start-1 row-end-3">
          <AppSidebar />
        </div>
        <div className="col-start-2 md-col-end-3 row-start-1 row-end-2">
          <AppTopbar />
        </div>
        <main className="col-start-2 md-col-end-3 md-row-start-2 md-row-end-3">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
