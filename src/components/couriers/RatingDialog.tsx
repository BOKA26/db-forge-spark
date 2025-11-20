import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface RatingDialogProps {
  deliveryId: string;
  courierId: string;
  courierName: string;
  isOpen: boolean;
  onClose: () => void;
  existingRating?: {
    id: string;
    rating: number;
    comment: string | null;
  };
}

export const RatingDialog = ({
  deliveryId,
  courierId,
  courierName,
  isOpen,
  onClose,
  existingRating,
}: RatingDialogProps) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingRating?.comment || '');

  const ratingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      if (existingRating) {
        // Mise à jour
        const { error } = await supabase
          .from('courier_ratings')
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq('id', existingRating.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('courier_ratings')
          .insert({
            delivery_id: deliveryId,
            livreur_id: courierId,
            acheteur_id: user.id,
            rating,
            comment: comment.trim() || null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-ratings'] });
      toast.success(existingRating ? 'Évaluation mise à jour' : 'Évaluation envoyée');
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'évaluation:', error);
      toast.error('Erreur lors de l\'évaluation');
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    ratingMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingRating ? 'Modifier' : 'Évaluer'} {courierName}
          </DialogTitle>
          <DialogDescription>
            Partagez votre expérience avec ce livreur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Note</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              {comment.length}/500 caractères
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={ratingMutation.isPending || rating === 0}
          >
            {ratingMutation.isPending ? 'Envoi...' : existingRating ? 'Modifier' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
