import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CollectionItem, WishlistItem } from '@/types';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface VinylModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'collection' | 'wishlist' | '';
    mode: 'view' | 'edit';
    data: CollectionItem | WishlistItem | null;
    onSave: () => void;
}

export function VinylModal({ open, onOpenChange, type, mode, data, onSave }: VinylModalProps) {
    const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
    const [condition, setCondition] = useState('Very Good');
    const [sleeveCondition, setSleeveCondition] = useState('Very Good');
    const [formData, setFormData] = useState<any>({});
    const { toast } = useToast();

    useEffect(() => {
        if (data) {
            setFormData(data);
            if ('PurchaseDate' in data && data.PurchaseDate) {
                setPurchaseDate(new Date(data.PurchaseDate));
            } else {
                setPurchaseDate(undefined);
            }
            if ('Condition' in data && data.Condition) setCondition(data.Condition);
            if ('SleeveCondition' in data && data.SleeveCondition) setSleeveCondition(data.SleeveCondition);
        }
    }, [data]);

    const handleSave = async () => {
        if (!data) return;

        try {
            if (type === 'collection') {
                const updateData = {
                    PurchaseDate: purchaseDate ? purchaseDate.toISOString().split('T')[0] : undefined,
                    PurchasePrice: formData.PurchasePrice,
                    Condition: condition,
                    SleeveCondition: sleeveCondition,
                    StorageLocation: formData.StorageLocation,
                    Notes: formData.Notes,
                    AcquiredFrom: formData.AcquiredFrom
                };
                await api.updateCollectionItem((data as CollectionItem).CollectionID, updateData);
            } else {
                // Wishlist update logic would go here
            }

            toast({ title: 'Item updated successfully' });
            onSave();
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Failed to update item', variant: 'destructive' });
        }
    };

    if (!data) return null;

    const isCollection = type === 'collection';
    const item = data as CollectionItem; // Safe cast for display purposes

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'view' ? 'View Details' : 'Edit Details'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Album</label>
                            <p className="text-lg font-semibold">{item.AlbumTitle}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Artist</label>
                            <p className="text-lg font-semibold">{item.ArtistName}</p>
                        </div>
                    </div>

                    {/* Static Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Catalog Number</label>
                            <p>{item.CatalogNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Label</label>
                            <p>{item.LabelName || 'Unknown'}</p>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    {mode === 'view' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Purchase Date</label>
                                    <p>{item.PurchaseDate ? format(new Date(item.PurchaseDate), "PPP") : 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Purchase Price</label>
                                    <p>{item.PurchasePrice ? '$' + Number(item.PurchasePrice).toFixed(2) : 'Not set'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Condition</label>
                                    <p>{item.Condition || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Sleeve Condition</label>
                                    <p>{item.SleeveCondition || 'N/A'}</p>
                                </div>
                            </div>
                            {item.Notes && (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Notes</label>
                                    <p className="whitespace-pre-wrap">{item.Notes}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Purchase Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !purchaseDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {purchaseDate ? format(purchaseDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={purchaseDate}
                                                onSelect={setPurchaseDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Purchase Price</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.PurchasePrice || ''}
                                        onChange={e => setFormData({ ...formData, PurchasePrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Condition</label>
                                    <Select value={condition} onValueChange={setCondition}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mint">Mint (M)</SelectItem>
                                            <SelectItem value="Near Mint">Near Mint (NM)</SelectItem>
                                            <SelectItem value="Very Good Plus">Very Good Plus (VG+)</SelectItem>
                                            <SelectItem value="Very Good">Very Good (VG)</SelectItem>
                                            <SelectItem value="Good Plus">Good Plus (G+)</SelectItem>
                                            <SelectItem value="Good">Good (G)</SelectItem>
                                            <SelectItem value="Fair">Fair (F)</SelectItem>
                                            <SelectItem value="Poor">Poor (P)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sleeve Condition</label>
                                    <Select value={sleeveCondition} onValueChange={setSleeveCondition}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mint">Mint (M)</SelectItem>
                                            <SelectItem value="Near Mint">Near Mint (NM)</SelectItem>
                                            <SelectItem value="Very Good Plus">Very Good Plus (VG+)</SelectItem>
                                            <SelectItem value="Very Good">Very Good (VG)</SelectItem>
                                            <SelectItem value="Good Plus">Good Plus (G+)</SelectItem>
                                            <SelectItem value="Good">Good (G)</SelectItem>
                                            <SelectItem value="Fair">Fair (F)</SelectItem>
                                            <SelectItem value="Poor">Poor (P)</SelectItem>
                                            <SelectItem value="No Sleeve">No Sleeve</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Acquired From</label>
                                <Input
                                    value={formData.AcquiredFrom || ''}
                                    onChange={e => setFormData({ ...formData, AcquiredFrom: e.target.value })}
                                    placeholder="Acquired From"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <Textarea
                                    value={formData.Notes || ''}
                                    onChange={e => setFormData({ ...formData, Notes: e.target.value })}
                                    placeholder="Notes"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
