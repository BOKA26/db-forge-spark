import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CourierRatingsProps {
  courierId: string;
}

export const CourierRatings = ({ courierId }: CourierRatingsProps) => {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['courier-ratings', courierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courier_ratings')
        .select(`
          *,
          acheteur:users!courier_ratings_acheteur_id_fkey(nom)
        `)
        .eq('livreur_id', courierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['courier-stats', courierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courier_ratings')
        .select('rating')
        .eq('livreur_id', courierId);

      if (error) throw error;

      if (data.length === 0) {
        return { average: 0, total: 0 };
      }

      const average = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
      return { average: Math.round(average * 10) / 10, total: data.length };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-3xl font-bold">{stats.average.toFixed(1)}</span>
              <span className="text-muted-foreground">/ 5</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({stats.total} {stats.total === 1 ? 'évaluation' : 'évaluations'})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Évaluations des clients</CardTitle>
          <CardDescription>
            {ratings && ratings.length > 0
              ? `${ratings.length} évaluation${ratings.length > 1 ? 's' : ''}`
              : 'Aucune évaluation pour le moment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ratings && ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating: any) => (
                <div key={rating.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {rating.acheteur?.nom?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rating.acheteur?.nom || 'Anonyme'}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-muted-foreground mb-2">{rating.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(rating.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune évaluation pour le moment
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
