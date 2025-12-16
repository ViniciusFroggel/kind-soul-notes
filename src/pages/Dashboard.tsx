import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, FileText, Calendar, ArrowRight } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalRecords: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (patientsError) throw patientsError;

      // Fetch stats
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: activePatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalRecords } = await supabase
        .from('patient_records')
        .select('*', { count: 'exact', head: true });

      setPatients(patientsData || []);
      setStats({
        totalPatients: totalPatients || 0,
        activePatients: activePatients || 0,
        totalRecords: totalRecords || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a) de volta! Aqui está o resumo do seu consultório.
          </p>
        </div>
        <Button onClick={() => navigate('/patients/new')} className="shadow-primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                <p className="text-3xl font-bold text-foreground">{stats.activePatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Prontuários</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif">Pacientes Recentes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
            Ver todos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Você ainda não tem pacientes cadastrados.</p>
              <Button onClick={() => navigate('/patients/new')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar primeiro paciente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {patient.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cadastrado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
