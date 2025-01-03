import { Link } from "react-router";

export function AppHeader() {
  return (
    <div className="border-b">
      <div className="flex items-center px-4 py-6">
        <nav className="flex items-center gap-4 lg:gap-6 mx-6 flex-wrap">
          <Link
            className="text-sm font-medium transition-colors hover:text-primary"
            to="/"
          >
            Overview
          </Link>
        </nav>
      </div>
    </div>
  );
}
