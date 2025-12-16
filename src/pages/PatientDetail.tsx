import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Plus,
  Clock,
  Edit,
  Trash2,
} from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  cpf: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface PatientRecord {
  id: string;
  session_date: string;
  session_type: string;
  main_complaint: string | null;
  session_notes: string | null;
  observations: string | null;
  next_session_goals: string | null;
  mood_state: string | null;
  interventions: string | null;
  created_at: string;
}

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    session_date: new Date().toISOString().split('T')[0],
    session_type: 'individual',
    main_complaint: '',
    session_notes: '',
    observations: '',
    next_session_goals: '',
    mood_state: '',
    interventions: '',
  });

  useEffect(() => {
    if (user && id) {
      fetchPatientData();
    }
  }, [user, id]);

  const fetchPatientData = async () => {
    try {
      const [patientRes, recordsRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).maybeSingle(),
        supabase
          .from('patient_records')
          .select('*')
          .eq('patient_id', id)
          .order('session_date', { ascending: false }),
      ]);

      if (patientRes.error) throw patientRes.error;
      if (recordsRes.error) throw recordsRes.error;

      if (!patientRes.data) {
        navigate('/patients');
        return;
      }

      setPatient(patientRes.data);
      setRecords(recordsRes.data || []);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do paciente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecordChange = (field: string, value: string) => {
    setNewRecord((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patient) return;

    setSavingRecord(true);

    try {
      const { error } = await supabase.from('patient_records').insert({
        patient_id: patient.id,
        psychologist_id: user.id,
        session_date: newRecord.session_date,
        session_type: newRecord.session_type,
        main_complaint: newRecord.main_complaint || null,
        session_notes: newRecord.session_notes || null,
        observations: newRecord.observations || null,
        next_session_goals: newRecord.next_session_goals || null,
        mood_state: newRecord.mood_state || null,
        interventions: newRecord.interventions || null,
      });

      if (error) throw error;

      toast({
        title: 'Prontuário criado!',
        description: 'O registro foi adicionado com sucesso.',
      });

      setIsNewRecordOpen(false);
      setNewRecord({
        session_date: new Date().toISOString().split('T')[0],
        session_type: 'individual',
        main_complaint: '',
        session_notes: '',
        observations: '',
        next_session_goals: '',
        mood_state: '',
        interventions: '',
      });
      fetchPatientData();
    } catch (error) {
      console.error('Error creating record:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o prontuário.',
        variant: 'destructive',
      });
    } finally {
      setSavingRecord(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: 'Ativo', className: 'bg-success/10 text-success border-success/20' },
      inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground' },
      discharged: { label: 'Alta', className: 'bg-info/10 text-info border-info/20' },
    };
    const variant = variants[status] || variants.inactive;
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  const getSessionTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      individual: 'Individual',
      couple: 'Casal',
      family: 'Família',
      group: 'Grupo',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl text-primary font-semibold">
                {patient.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">{patient.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(patient.status)}
                <span className="text-sm text-muted-foreground">
                  Desde {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">Novo Prontuário de Sessão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRecord} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_date">Data da Sessão</Label>
                  <Input
                    id="session_date"
                    type="date"
                    value={newRecord.session_date}
                    onChange={(e) => handleNewRecordChange('session_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_type">Tipo de Sessão</Label>
                  <Select
                    value={newRecord.session_type}
                    onValueChange={(value) => handleNewRecordChange('session_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="couple">Casal</SelectItem>
                      <SelectItem value="family">Família</SelectItem>
                      <SelectItem value="group">Grupo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood_state">Estado Emocional</Label>
                <Input
                  id="mood_state"
                  value={newRecord.mood_state}
                  onChange={(e) => handleNewRecordChange('mood_state', e.target.value)}
                  placeholder="Como o paciente se apresentou"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main_complaint">Queixa Principal</Label>
                <Textarea
                  id="main_complaint"
                  value={newRecord.main_complaint}
                  onChange={(e) => handleNewRecordChange('main_complaint', e.target.value)}
                  placeholder="Principal tema ou queixa da sessão"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_notes">Evolução / Anotações da Sessão</Label>
                <Textarea
                  id="session_notes"
                  value={newRecord.session_notes}
                  onChange={(e) => handleNewRecordChange('session_notes', e.target.value)}
                  placeholder="Detalhes e anotações sobre a sessão..."
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interventions">Intervenções Realizadas</Label>
                <Textarea
                  id="interventions"
                  value={newRecord.interventions}
                  onChange={(e) => handleNewRecordChange('interventions', e.target.value)}
                  placeholder="Técnicas e intervenções utilizadas"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations">Observações Clínicas</Label>
                <Textarea
                  id="observations"
                  value={newRecord.observations}
                  onChange={(e) => handleNewRecordChange('observations', e.target.value)}
                  placeholder="Observações relevantes"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_session_goals">Objetivos Próxima Sessão</Label>
                <Textarea
                  id="next_session_goals"
                  value={newRecord.next_session_goals}
                  onChange={(e) => handleNewRecordChange('next_session_goals', e.target.value)}
                  placeholder="O que trabalhar na próxima sessão"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewRecordOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingRecord}>
                  {savingRecord ? 'Salvando...' : 'Salvar Prontuário'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Prontuários
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Dados Pessoais
          </TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          {records.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum prontuário registrado para este paciente.
                </p>
                <Button onClick={() => setIsNewRecordOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro prontuário
                </Button>
              </CardContent>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id} className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-serif">
                          {new Date(record.session_date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary">{getSessionTypeBadge(record.session_type)}</Badge>
                          {record.mood_state && (
                            <span className="text-muted-foreground">• {record.mood_state}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.main_complaint && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Queixa Principal</h4>
                      <p className="text-muted-foreground">{record.main_complaint}</p>
                    </div>
                  )}
                  {record.session_notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Evolução</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{record.session_notes}</p>
                    </div>
                  )}
                  {record.interventions && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Intervenções</h4>
                      <p className="text-muted-foreground">{record.interventions}</p>
                    </div>
                  )}
                  {record.observations && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Observações</h4>
                      <p className="text-muted-foreground">{record.observations}</p>
                    </div>
                  )}
                  {record.next_session_goals && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Objetivos Próxima Sessão</h4>
                      <p className="text-muted-foreground">{record.next_session_goals}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                )}
                {patient.birth_date && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium">
                        {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
                {patient.cpf && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">{patient.cpf}</p>
                    </div>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{patient.address}</p>
                    </div>
                  </div>
                )}
                {(patient.emergency_contact || patient.emergency_phone) && (
                  <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="font-semibold mb-4">Contato de Emergência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patient.emergency_contact && (
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-medium">{patient.emergency_contact}</p>
                        </div>
                      )}
                      {patient.emergency_phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p className="font-medium">{patient.emergency_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {patient.notes && (
                  <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Observações</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
