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
import { Upload } from "lucide-react";

interface AddPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPetDialog = ({ open, onOpenChange }: AddPetDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Insert pet
      const { error } = await supabase.from("pets").insert({
        owner_id: user.id,
        name,
        species,
        breed: breed || null,
        date_of_birth: dateOfBirth || null,
        notes: notes || null,
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast.success(`${name} has been added!`);
      onOpenChange(false);
      resetForm();
      window.location.reload(); // Refresh to show new pet
    } catch (error: any) {
      toast.error(error.message || "Failed to add pet");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSpecies("");
    setBreed("");
    setDateOfBirth("");
    setNotes("");
    setPhotoFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Pet</DialogTitle>
          <DialogDescription>
            Add your pet's information to start tracking their care
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Photo (optional)</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {photoFile ? photoFile.name : "Upload Photo"}
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Buddy"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">Species *</Label>
            <Select value={species} onValueChange={setSpecies} required>
              <SelectTrigger>
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Dog</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
                <SelectItem value="bird">Bird</SelectItem>
                <SelectItem value="rabbit">Rabbit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed (optional)</Label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Golden Retriever"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth (optional)</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes about your pet..."
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
              {loading ? "Adding..." : "Add Pet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPetDialog;
