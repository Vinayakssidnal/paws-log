import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint } from "lucide-react";
import { toast } from "sonner";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  photo_url?: string;
}

interface PetListProps {
  selectedPetId: string | null;
  onSelectPet: (id: string) => void;
}

const PetList = ({ selectedPetId, onSelectPet }: PetListProps) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPets(data || []);
      
      // Auto-select first pet if none selected
      if (data && data.length > 0 && !selectedPetId) {
        onSelectPet(data[0].id);
      }
    } catch (error: any) {
      toast.error("Failed to load pets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (pets.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
          <PawPrint className="w-8 h-8 text-secondary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No pets yet. Add your first pet to get started!</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <h2 className="font-semibold text-lg mb-4">Your Pets</h2>
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => onSelectPet(pet.id)}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            selectedPetId === pet.id
              ? "border-primary bg-primary/5 shadow-warm"
              : "border-border hover:border-primary/50 hover:shadow-soft"
          }`}
        >
          <div className="flex items-center gap-3">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-secondary-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{pet.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {pet.species}
                </Badge>
                {pet.breed && (
                  <span className="text-xs text-muted-foreground truncate">
                    {pet.breed}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </Card>
  );
};

export default PetList;
