import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { PawPrint, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import PetList from "@/components/PetList";
import LogsSection from "@/components/LogsSection";
import AddPetDialog from "@/components/AddPetDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [addPetOpen, setAddPetOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Pet Care Log
                </h1>
                <p className="text-sm text-muted-foreground">Track your pets' care and wellbeing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAddPetOpen(true)}
                className="bg-gradient-primary hover:opacity-90 transition-all shadow-warm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pet
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
                className="transition-all hover:shadow-soft"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pet List - Left Sidebar */}
          <div className="lg:col-span-1">
            <PetList
              selectedPetId={selectedPetId}
              onSelectPet={setSelectedPetId}
            />
          </div>

          {/* Logs Section - Main Area */}
          <div className="lg:col-span-3">
            {selectedPetId ? (
              <LogsSection petId={selectedPetId} />
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-soft">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="w-10 h-10 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a Pet</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a pet from the list to view and manage their care logs
                </p>
                <Button
                  onClick={() => setAddPetOpen(true)}
                  variant="outline"
                  className="transition-all hover:shadow-soft"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Pet
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddPetDialog open={addPetOpen} onOpenChange={setAddPetOpen} />
    </div>
  );
};

export default Dashboard;
