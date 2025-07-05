"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getSetting } from "@/services/api/SettingService";
import { SettingService } from "@/services/api";
import { toast } from "sonner";
import { getMyInfor } from "@/services/api/UserAdminService";
import { useLang } from "@/lang/useLang";

export default function SettingsPage() {
  const { t } = useLang();
  const { data: setting, isLoading, refetch: refetchSetting } = useQuery({
    queryKey: ["setting"],
    queryFn: getSetting,
  });

  const { data: myInfor} = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      console.warn("Please fill in all password fields");
      toast.error(t("settings.errors.fillAllFields"));
      return;
    }

    if (passwords.currentPassword.length < 4) {
      console.warn("Current password must be at least 4 characters long");
      toast.error(t("settings.errors.currentPasswordLength"));
      return;
    }

    if (passwords.newPassword.length < 4) {
      console.warn("New password must be at least 4 characters long");
      toast.error(t("settings.errors.newPasswordLength"));
      return;
    }

    if (passwords.confirmPassword.length < 4) {
      console.warn("Confirm password must be at least 4 characters long");
      toast.error(t("settings.errors.confirmPasswordLength"));
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      console.warn("New password and confirmation do not match");
      toast.error(t("settings.errors.passwordsNotMatch"));
      return;
    }

    try {
      await SettingService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      console.log("Password changed successfully");
      toast.success(t("settings.success.passwordChanged"));
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      if( error.status === 401) {
        toast.error(t("settings.errors.currentPasswordIncorrect"));
      } else {
        toast.error(t("settings.errors.changePasswordFailed"));
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="profile">{t("settings.tabs.profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.tabs.security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t("settings.profile.title")}</CardTitle>
              <CardDescription>
                {t("settings.profile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col items-center">
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="username">{t("settings.profile.username")}</Label>
                <Input
                  id="username"
                  value={myInfor?.username || ''}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="email">{t("settings.profile.email")}</Label>
                <Input
                  id="email"
                  value={myInfor?.email || ''}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="role">{t("settings.profile.role")}</Label>
                <Input
                  id="role"
                  value={myInfor?.role || ''}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="created-at">{t("settings.profile.accountCreated")}</Label>
                <Input
                  id="created-at"
                  value={myInfor?.createdAt ? formatDate(myInfor.createdAt) : 'N/A'}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="updated-at">{t("settings.profile.lastUpdated")}</Label>
                <Input
                  id="updated-at"
                  value={myInfor?.updatedAt ? formatDate(myInfor.updatedAt) : 'N/A'}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t("settings.security.title")}</CardTitle>
              <CardDescription>{t("settings.security.description")}</CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
            >
              <CardContent className="space-y-4 flex flex-col items-center">
                <div className="space-y-2 w-full max-w-lg">
                  <Label htmlFor="current-password">{t("settings.security.currentPassword")}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                  />
                </div>
                <div className="space-y-2 w-full max-w-lg">
                  <Label htmlFor="new-password">{t("settings.security.newPassword")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                  />
                </div>
                <div className="space-y-2 w-full max-w-lg">
                  <Label htmlFor="confirm-password">{t("settings.security.confirmPassword")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">{t("settings.security.saveChanges")}</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
