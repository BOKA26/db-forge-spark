import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export const InquiryDialog = ({ open, onOpenChange, productId, productName }: InquiryDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    quantity: ""
  });

  const submitInquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("inquiries").insert({
        product_id: productId,
        buyer_name: data.name,
        buyer_email: data.email,
        buyer_phone: data.phone || null,
        message: data.message,
        quantity: parseInt(data.quantity) || 1
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ Demande envoyée",
        description: "Le vendeur va vous contacter bientôt.",
      });
      setFormData({ name: "", email: "", phone: "", message: "", quantity: "" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error submitting inquiry:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message || !formData.quantity) {
      toast({
        title: "⚠️ Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    submitInquiryMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Envoyer une demande</DialogTitle>
          <DialogDescription>
            Demandez des informations pour: <span className="font-semibold text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              placeholder="Votre nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+225 XX XX XX XX XX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité souhaitée *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Ex: 100"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre besoin, posez vos questions..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitInquiryMutation.isPending}
              className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            >
              {submitInquiryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer la demande"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
