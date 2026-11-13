// Stand-in for next/navigation: the capture does not run inside Next's app router.
export const useRouter = () => ({ push() {}, replace() {}, back() {}, forward() {}, refresh() {}, prefetch() {} });
export const useSearchParams = () => new URLSearchParams();
export const usePathname = () => "/app/products/home-management-companion/setup";
export const useParams = () => ({ productSlug: "home-management-companion" });
