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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getSetting } from "@/services/api/SettingService";
import { SettingService } from "@/services/api";

export default function SettingsPage() {
  const { data: setting, isLoading } = useQuery({
    queryKey: ["setting"],
    queryFn: getSetting,
  });

  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const [generalSettings, setGeneralSettings] = useState({
    appName: "",
    logo: null as File | null,
    telegramBot: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (setting) {
      setGeneralSettings({
        appName: setting.appName || "",
        logo: setting.logo || null,
        telegramBot: setting.telegramBot || "",
      });
    }
  }, [setting]);

  const handleUpdateGeneralSetting = async () => {
    try {
      const formData = new FormData();
      formData.append("appName", generalSettings.appName);
      formData.append("telegramBot", generalSettings.telegramBot);
      if (generalSettings.logo) {
        formData.append("logo", generalSettings.logo);
      }
      await SettingService.updateSetting(formData);
      console.log("Settings updated successfully");
    } catch (error) {
      console.warn("Error updating settings:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      console.warn("Please fill in all password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      console.warn("New password and confirm password do not match");
      return;
    }

    try {
      await SettingService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      console.log("Password changed successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.warn("Error changing password:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your basic account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={generalSettings.appName}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      appName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="relative flex-shrink-0">
                      <div className="h-24 w-24 rounded-md border-2 border-dashed border-primary/20 flex items-center justify-center bg-background overflow-hidden">
                        {generalSettings.logo ? (
                          <img
                            src={
                              typeof generalSettings.logo === "string"
                                ? `${process.env.NEXT_PUBLIC_API_URL}${generalSettings.logo}`
                                : URL.createObjectURL(generalSettings.logo)
                            }
                            alt="Current logo"
                            className="max-h-20 max-w-20 object-contain"
                          />
                        ) : (
                          <span className="text-muted-foreground">No logo</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-grow">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Upload a new logo</p>
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 512x512px. Max file size: 2MB.
                          Supported formats: PNG, JPG, SVG
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="relative"
                        >
                          <input
                            type="file"
                            id="logo-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/svg+xml"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setGeneralSettings((prev) => ({
                                  ...prev,
                                  logo: file,
                                }));
                              }
                            }}
                          />
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramBot">Telegram Bot</Label>
                <Input
                  id="telegramBot"
                  placeholder="Enter your Telegram bot token"
                  value={generalSettings.telegramBot}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      telegramBot: e.target.value,
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Create a bot on Telegram via @BotFather and paste the token
                  here.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdateGeneralSetting}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="telegram-notifications">
                    Telegram Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via Telegram bot
                  </p>
                </div>
                <Switch
                  id="telegram-notifications"
                  checked={telegramNotifications}
                  onCheckedChange={setTelegramNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="security-alerts">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts about security incidents
                  </p>
                </div>
                <Switch
                  id="security-alerts"
                  checked={securityAlerts}
                  onCheckedChange={setSecurityAlerts}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
            >
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
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
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
