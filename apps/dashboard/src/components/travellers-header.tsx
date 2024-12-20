import { OpenCustomerSheet } from "./open-traveller-sheet";
import { SearchField } from "./search-field";

export async function TravellersHeader() {
  return (
    <div className="flex items-center justify-between">
      <SearchField placeholder="Search customers" />

      <div className="hidden sm:block">
        <OpenCustomerSheet />
      </div>
    </div>
  );
}
