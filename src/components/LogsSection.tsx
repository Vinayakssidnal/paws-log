import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import LogCard from "./LogCard";
import AddLogDialog from "./AddLogDialog";
import LogFilters from "./LogFilters";

interface Log {
  id: string;
  type: string;
  timestamp: string;
  quantity?: number;
  quantity_unit?: string;
  duration_mins?: number;
  caregiver?: string;
  notes?: string;
}

interface LogsSectionProps {
  petId: string;
}

const LogsSection = ({ petId }: LogsSectionProps) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLogOpen, setAddLogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [petId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("pet_id", petId)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error("Failed to load logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesSearch = !searchTerm || 
      log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.caregiver?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Care Logs</h2>
        <Button
          onClick={() => setAddLogOpen(true)}
          className="bg-gradient-primary hover:opacity-90 shadow-warm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Log
        </Button>
      </div>

      <LogFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {filteredLogs.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {logs.length === 0 ? "No logs yet. Add your first care log!" : "No logs match your filters"}
          </p>
          {logs.length === 0 && (
            <Button
              onClick={() => setAddLogOpen(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Log
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <LogCard key={log.id} log={log} onUpdate={fetchLogs} />
          ))}
        </div>
      )}

      <AddLogDialog
        open={addLogOpen}
        onOpenChange={setAddLogOpen}
        petId={petId}
        onSuccess={fetchLogs}
      />
    </div>
  );
};

export default LogsSection;
