import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

type Team = {
  id: number;
  name: string;
  owner_name: string;
  created_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Team settings',
    href: '/settings/teams',
  },
];

export default function SettingsTeams() {
  const { teams } = usePage<SharedData & { teams: Team[] }>().props;

  console.log('teams', teams);

  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name: '',
  });

  const openCreateForm = () => {
    reset();
    setEditMode(false);
    setEditingTeam(null);
    setFormOpen(true);
  };

  const openEditForm = (team: Team) => {
    setData('name', team.name);
    setEditingTeam(team);
    setEditMode(true);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTeam(null);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editMode && editingTeam) {
      patch(route('teams.update', editingTeam.id), {
        preserveScroll: true,
        onSuccess: closeForm,
      });
    } else {
      post(route('teams.store'), {
        preserveScroll: true,
        onSuccess: closeForm,
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Team settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <HeadingSmall title="Teams" description="Manage your project teams" />
            <Button onClick={openCreateForm}>Add Team</Button>
          </div>

          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Owner: {team.owner_name} · Created: {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button onClick={() => openEditForm(team)} size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>

          {formOpen && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Team name"
                  required
                />
                <InputError message={errors.name} className="mt-1" />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                  {editMode ? 'Update Team' : 'Create Team'}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
