import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export default function NewPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    cpf: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: '',
    status: 'active',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.full_name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do paciente.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          psychologist_id: user.id,
          full_name: formData.full_name.trim(),
          email: formData.email || null,
          phone: formData.phone || null,
          birth_date: formData.birth_date || null,
          cpf: formData.cpf || null,
          address: formData.address || null,
          emergency_contact: formData.emergency_contact || null,
          emergency_phone: formData.emergency_phone || null,
          notes: formData.notes || null,
          status: formData.status,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Paciente cadastrado!',
        description: 'O paciente foi adicionado com sucesso.',
      });

      navigate(`/patients/${data.id}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o paciente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Novo Paciente</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados do paciente para cadastrá-lo no sistema.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Informações básicas do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Nome completo do paciente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Endereço completo"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Contato de Emergência
            </CardTitle>
            <CardDescription>Pessoa para contato em caso de emergência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Nome do Contato</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => handleChange('emergency_contact', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
                <Input
                  id="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={(e) => handleChange('emergency_phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="discharged">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações Iniciais</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Anotações importantes sobre o paciente..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="shadow-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Cadastrar Paciente
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
