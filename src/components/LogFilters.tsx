import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface LogFiltersProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const LogFilters = ({
  filterType,
  onFilterChange,
  searchTerm,
  onSearchChange,
}: LogFiltersProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-type">Filter by Type</Label>
          <Select value={filterType} onValueChange={onFilterChange}>
            <SelectTrigger id="filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="feeding">🍖 Feeding</SelectItem>
              <SelectItem value="walking">🚶 Walking</SelectItem>
              <SelectItem value="grooming">✂️ Grooming</SelectItem>
              <SelectItem value="medical">💊 Medical</SelectItem>
              <SelectItem value="medication">💉 Medication</SelectItem>
              <SelectItem value="other">📝 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">Search Logs</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes or caregiver..."
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogFilters;
