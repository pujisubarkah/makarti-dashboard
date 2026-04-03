import React, { useMemo } from 'react';
import { Pelatihan } from '@/types/shared';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, BookOpen, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TrainingHistoryProps {
  pelatihan: Pelatihan[];
  loading: boolean;
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <span className="text-sm text-muted-foreground">Memuat data pelatihan...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
    <div className="p-4 bg-muted/50 rounded-full">
      <BookOpen className="w-8 h-8 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="font-medium text-foreground">Belum ada data pelatihan</p>
      <p className="text-sm text-muted-foreground">
        Data riwayat pelatihan akan muncul di sini.
      </p>
    </div>
  </div>
);

const TotalHours = ({ total }: { total: number }) => (
  <Card className="mb-6 bg-primary/5 border-primary/20">
    <CardContent className="flex items-center justify-between p-0">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Jam Pembelajaran</p>
          <p className="text-2xl font-bold text-primary">{total} Jam</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrainingTable = ({ pelatihan }: { pelatihan: Pelatihan[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-[80px]">No</TableHead>
          <TableHead>Judul Pelatihan</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead className="text-right">Jam</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pelatihan.map((p, index) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
            <TableCell className="font-medium">{p.judul}</TableCell>
            <TableCell className="text-muted-foreground">
{p.tanggal ? format(new Date(p.tanggal), 'dd/MM/yyyy') : '-'}
            </TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary" className="font-medium">
                {p.jam || 0} Jam
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default function TrainingHistory({ pelatihan, loading }: TrainingHistoryProps) {
  const totalHours = useMemo(() => pelatihan.reduce((sum, p) => sum + (p.jam || 0), 0), [pelatihan]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <TotalHours total={totalHours} />
      {pelatihan.length === 0 ? <EmptyState /> : <TrainingTable pelatihan={pelatihan} />}
    </div>
  );
}