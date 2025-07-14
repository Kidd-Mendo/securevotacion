import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Settings, Shield, Mail, Calendar, Edit3, Check, X, Loader2, Camera, AlertCircle, Info } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("/api/profile/update", {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: t.profile.profileUpdated,
        description: t.profile.profileUpdatedDesc,
      });
      setIsEditing(false);
      setShowConfirmDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: t.profile.profileUpdateError,
        description: t.profile.profileUpdateErrorDesc,
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasChanges()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmUpdate = () => {
    updateProfileMutation.mutate(formData);
  };

  const getChangedFields = () => {
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

    if (formData.firstName !== (user?.firstName || "")) {
      changes.push({
        field: t.profile.firstName,
        oldValue: user?.firstName || "Sin especificar",
        newValue: formData.firstName || "Sin especificar"
      });
    }

    if (formData.lastName !== (user?.lastName || "")) {
      changes.push({
        field: t.profile.lastName, 
        oldValue: user?.lastName || "Sin especificar",
        newValue: formData.lastName || "Sin especificar"
      });
    }

    if (formData.email !== (user?.email || "")) {
      changes.push({
        field: t.profile.email,
        oldValue: user?.email || "",
        newValue: formData.email
      });
    }

    return changes;
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "administrator": return "destructive";
      case "teacher": return "default";
      case "student": return "secondary";
      case "educational_authority": return "outline";
      default: return "secondary";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "administrator": return t.roles.administrator;
      case "teacher": return t.roles.teacher;
      case "student": return t.roles.student;
      case "authority": return t.roles.authority;
      default: return role;
    }
  };

  const hasChanges = () => {
    return (
      formData.firstName !== (user?.firstName || "") ||
      formData.lastName !== (user?.lastName || "") ||
      formData.email !== (user?.email || "")
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.profile.title}</h1>
        <p className="text-muted-foreground">{t.profile.description}</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{t.profile.security}</p>
              <p className="text-xs text-muted-foreground">{t.profile.securityDesc}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-sm">{t.profile.activity}</p>
              <p className="text-xs text-muted-foreground">{t.profile.activityDesc}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">{t.profile.notifications}</p>
              <p className="text-xs text-muted-foreground">{t.profile.notificationsDesc}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{t.profile.preferences}</p>
              <p className="text-xs text-muted-foreground">{t.profile.preferencesDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "Usuario"} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full p-1 h-8 w-8"
                    aria-label={t.profile.changeProfilePicture}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.firstName} {user.lastName}
                    <Badge variant={getRoleBadgeColor(user.role || "student")}>
                      {getRoleDisplayName(user.role || "student")}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? t.profile.cancel : t.profile.edit}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">{t.profile.personalInfo}</CardTitle>
            <CardDescription className="mb-4">{t.profile.personalInfoDesc}</CardDescription>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información sobre cambios */}
                {hasChanges() && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t.profile.unsavedChanges}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      {t.profile.firstName} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder={t.profile.firstName}
                      className="focus-ring"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      {t.profile.lastName} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={t.profile.lastName}
                      className="focus-ring"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">
                    {t.profile.email} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.profile.email}
                    className="focus-ring"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="submit" 
                    disabled={!hasChanges() || updateProfileMutation.isPending}
                    className="flex items-center gap-2 focus-ring"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.common.loading}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {t.profile.save}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 focus-ring"
                  >
                    <X className="h-4 w-4" />
                    {t.profile.cancel}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t.profile.firstName}</Label>
                    <p className="text-sm">{user.firstName || "Sin especificar"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t.profile.lastName}</Label>
                    <p className="text-sm">{user.lastName || "Sin especificar"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.profile.email}</Label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.profile.role}</Label>
                  <p className="text-sm">{getRoleDisplayName(user.role || "student")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.profile.accountStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.profile.status}</span>
              <Badge variant="secondary">{t.profile.active}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.profile.role}</span>
              <Badge variant={getRoleBadgeColor(user.role || "student")}>
                {getRoleDisplayName(user.role || "student")}
              </Badge>
            </div>
            <Separator />
            <div className="text-center text-sm text-muted-foreground">
              <p>{t.profile.authMethod}</p>
              <p className="font-medium">Replit Auth</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {t.profile.confirmChanges}
            </DialogTitle>
            <DialogDescription>
              {t.profile.confirmChangesDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {getChangedFields().map((change, index) => (
              <div key={index} className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-sm">{change.field}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><span className="font-medium">{t.profile.oldValue}:</span> {change.oldValue}</p>
                  <p><span className="font-medium">{t.profile.newValue}:</span> {change.newValue}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t.profile.cancel}
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.common.loading}
                </>
              ) : (
                t.profile.confirmUpdate
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}