import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  onSuccess: () => void;
}

const AddLogDialog = ({ open, onOpenChange, petId, onSuccess }: AddLogDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [caregiver, setCaregiver] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("logs").insert({
        pet_id: petId,
        type,
        timestamp: new Date(timestamp).toISOString(),
        quantity: quantity ? parseFloat(quantity) : null,
        quantity_unit: quantityUnit || null,
        duration_mins: durationMins ? parseInt(durationMins) : null,
        caregiver: caregiver || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Log added successfully!");
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to add log");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType("");
    setTimestamp(new Date().toISOString().slice(0, 16));
    setQuantity("");
    setQuantityUnit("");
    setDurationMins("");
    setCaregiver("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Care Log</DialogTitle>
          <DialogDescription>
            Record a care activity for your pet
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="timestamp">Date & Time *</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
            />
          </div>

          {(type === "feeding") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  placeholder="grams"
                />
              </div>
            </div>
          )}

          {type === "walking" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                placeholder="30"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="caregiver">Caregiver</Label>
            <Input
              id="caregiver"
              value={caregiver}
              onChange={(e) => setCaregiver(e.target.value)}
              placeholder="Who provided the care?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-primary hover:opacity-90 shadow-warm"
            >
              {loading ? "Adding..." : "Add Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLogDialog;
