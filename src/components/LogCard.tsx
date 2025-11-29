import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface LogCardProps {
  log: Log;
  onUpdate: () => void;
}

const getLogIcon = (type: string) => {
  const icons: Record<string, string> = {
    feeding: "🍖",
    walking: "🚶",
    grooming: "✂️",
    medical: "💊",
    medication: "💉",
    other: "📝",
  };
  return icons[type] || "📝";
};

const getLogColor = (type: string) => {
  const colors: Record<string, string> = {
    feeding: "bg-orange-100 text-orange-700",
    walking: "bg-blue-100 text-blue-700",
    grooming: "bg-purple-100 text-purple-700",
    medical: "bg-red-100 text-red-700",
    medication: "bg-pink-100 text-pink-700",
    other: "bg-gray-100 text-gray-700",
  };
  return colors[type] || "bg-gray-100 text-gray-700";
};

const LogCard = ({ log, onUpdate }: LogCardProps) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("logs").delete().eq("id", log.id);
      if (error) throw error;
      toast.success("Log deleted");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to delete log");
      console.error(error);
    }
  };

  return (
    <Card className="p-6 hover:shadow-soft transition-all">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{getLogIcon(log.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getLogColor(log.type)}>
                {log.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            {log.quantity && (
              <p className="text-sm">
                <span className="font-medium">Quantity:</span> {log.quantity}{" "}
                {log.quantity_unit}
              </p>
            )}
            {log.duration_mins && (
              <p className="text-sm">
                <span className="font-medium">Duration:</span> {log.duration_mins} minutes
              </p>
            )}
            {log.caregiver && (
              <p className="text-sm">
                <span className="font-medium">Caregiver:</span> {log.caregiver}
              </p>
            )}
            {log.notes && (
              <p className="text-sm text-muted-foreground">{log.notes}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LogCard;
