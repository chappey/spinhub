import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    fullScreen?: boolean;
}

export function ErrorState({
    title = "Something went wrong",
    message = "An error occurred while loading data.",
    onRetry,
    fullScreen = false
}: ErrorStateProps) {
    const Content = (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-2">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                {Content}
            </div>
        );
    }

    return Content;
}
