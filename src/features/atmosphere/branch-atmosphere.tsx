import { AmbientStarfield } from "./ambient-starfield";

/** One viewport-sized canvas follows the route, not individual graph scenes. */
export function BranchAtmosphere() {
  return <div className="branch-atmosphere" aria-hidden="true">
    <div className="branch-atmosphere-viewport"><AmbientStarfield seed="shared-public-universe" /></div>
  </div>;
}
