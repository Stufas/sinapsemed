import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Copy, 
  Trophy, 
  TrendingUp, 
  Crown,
  Medal,
  Star,
  LogOut
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  total_points: number;
  joined_at: string;
  profiles: {
    display_name: string;
  };
}

interface Activity {
  id: string;
  activity_type: string;
  points: number;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

const Community = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupDetails(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (!memberships) return;

    const groupIds = memberships.map(m => m.group_id);
    
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds)
      .order("created_at", { ascending: false });

    if (groupsData) {
      setGroups(groupsData);
      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0]);
      }
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    // Load members
    const { data: membersData } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("total_points", { ascending: false });

    if (membersData) {
      // Fetch profile data separately
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const membersWithProfiles = membersData.map(member => ({
        ...member,
        profiles: profilesData?.find(p => p.id === member.user_id) || { display_name: "Usuário" }
      }));

      setMembers(membersWithProfiles as any);
    }

    // Load recent activities
    const { data: activitiesData } = await supabase
      .from("user_activities")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (activitiesData) {
      // Fetch profile data separately
      const userIds = [...new Set(activitiesData.map(a => a.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const activitiesWithProfiles = activitiesData.map(activity => ({
        ...activity,
        profiles: profilesData?.find(p => p.id === activity.user_id) || { display_name: "Usuário" }
      }));

      setActivities(activitiesWithProfiles as any);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o grupo",
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: group, error } = await supabase
      .from("groups")
      .insert([{
        name: newGroup.name,
        description: newGroup.description,
        created_by: user.id,
        invite_code: ""
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Add creator as member
    await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id
    });

    setNewGroup({ name: "", description: "" });
    loadGroups();
    
    toast({
      title: "Grupo criado! 🎉",
      description: `Código de convite: ${group.invite_code}`
    });
  };

  const joinGroup = async () => {
    if (!inviteCode) {
      toast({
        title: "Código obrigatório",
        description: "Digite o código de convite",
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find group by invite code
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (!group) {
      toast({
        title: "Grupo não encontrado",
        description: "Código de convite inválido",
        variant: "destructive"
      });
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      toast({
        title: "Você já está neste grupo",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id
    });

    if (error) {
      toast({
        title: "Erro ao entrar no grupo",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setInviteCode("");
    loadGroups();
    
    toast({
      title: "Entrou no grupo! 🎉",
      description: `Bem-vindo ao ${group.name}`
    });
  };

  const leaveGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }

    loadGroups();
    
    toast({
      title: "Você saiu do grupo",
      description: "Até a próxima!"
    });
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seus amigos"
    });
  };

  const getActivityIcon = (type: string) => {
    if (type.includes("FLASHCARD")) return "🎴";
    if (type.includes("QUESTION")) return "❓";
    if (type.includes("PRACTICE")) return "📝";
    if (type.includes("STUDY")) return "⏱️";
    return "⭐";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Comunidade</h1>
        <p className="text-muted-foreground">Compete com amigos e acompanhe seu progresso</p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo à Comunidade!</CardTitle>
            <CardDescription>
              Crie um grupo ou entre em um existente para começar a competir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Criar Grupo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nome do Grupo</Label>
                    <Input
                      placeholder="Ex: Turma de Medicina 2025"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea
                      placeholder="Sobre o grupo..."
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={createGroup}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Grupo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entrar em Grupo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Código de Convite</Label>
                    <Input
                      placeholder="Digite o código"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      maxLength={8}
                    />
                  </div>
                  <Button className="w-full" onClick={joinGroup}>
                    <Users className="mr-2 h-4 w-4" />
                    Entrar no Grupo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups">Meus Grupos</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <div className="grid gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{group.name}</CardTitle>
                        {group.description && (
                          <CardDescription>{group.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => leaveGroup(group.id)}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteCode(group.invite_code)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {group.invite_code}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Ver Ranking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Outro Grupo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Código de Convite</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o código"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={8}
                      />
                      <Button onClick={joinGroup}>
                        Entrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            {selectedGroup && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Ranking - {selectedGroup.name}</CardTitle>
                      <CardDescription>Competição de pontos</CardDescription>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(index)}
                          </div>
                          <div>
                            <p className="font-medium">{member.profiles?.display_name || "Usuário"}</p>
                            <p className="text-xs text-muted-foreground">
                              Desde {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {member.total_points} pts
                        </Badge>
                      </div>
                    ))}

                    {members.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum membro no grupo ainda</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            {selectedGroup && (
              <Card>
                <CardHeader>
                  <CardTitle>Feed de Atividades - {selectedGroup.name}</CardTitle>
                  <CardDescription>Últimas conquistas do grupo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
                          <div>
                            <p className="text-sm font-medium">
                              {activity.profiles?.display_name || "Usuário"} ganhou {activity.points} pontos
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.activity_type.replace(/_/g, " ").toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}

                    {activities.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma atividade ainda</p>
                        <p className="text-sm">Comece a estudar para ganhar pontos!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Community;
