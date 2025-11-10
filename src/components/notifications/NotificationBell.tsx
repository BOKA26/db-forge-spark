import { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationBellProps {
  iconClassName?: string;
  className?: string;
  showLabel?: boolean;
}

export const NotificationBell = ({ iconClassName = "h-5 w-5", className, showLabel }: NotificationBellProps = {}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = notifications?.length || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <div className={cn("flex flex-col items-center justify-center gap-1", showLabel && "w-full")}>
            <div className="relative">
              <Bell className={iconClassName} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {showLabel && <span className="text-[10px]">Notifs</span>}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mb-4">Notifications</h3>
          
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 rounded-lg bg-muted/50 space-y-1"
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune notification
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
