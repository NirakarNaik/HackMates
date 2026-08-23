"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import ChipSelect, { OptionSelect } from "@/components/ChipSelect";
import {
  ROLES,
  SKILLS,
  INTERESTS,
  LOOKING_FOR,
  EXPERIENCE_LEVELS,
  AVAILABILITY_OPTIONS,
} from "@/lib/constants";
import { extractGithubUsername } from "@/lib/utils";

// Mounted fresh when editing starts; initial values come from props.
export default function ProfileEditForm({ user, initial, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [name, setName] = useState(initial?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url || "");
  const [bio, setBio] = useState(initial?.bio || "");
  const [role, setRole] = useState(initial?.role || "");
  const [skills, setSkills] = useState(initial?.skills || []);
  const [interests, setInterests] = useState(initial?.interests || []);
  const [lookingFor, setLookingFor] = useState(initial?.looking_for || []);
  const [experienceLevel, setExperienceLevel] = useState(initial?.experience_level || "");
  const [availability, setAvailability] = useState(initial?.availability || "");
  const [githubUrl, setGithubUrl] = useState(initial?.github_url || "");
  const [githubSkills, setGithubSkills] = useState(initial?.github_skills || []);
  const [githubTopics, setGithubTopics] = useState(initial?.github_topics || []);
  const [githubSyncedAt, setGithubSyncedAt] = useState(initial?.github_synced_at || null);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [githubSyncMsg, setGithubSyncMsg] = useState(null);
  const [githubSyncErr, setGithubSyncErr] = useState(null);
  const [discordUsername, setDiscordUsername] = useState(initial?.discord_username || "");

  async function handleSave() {
    if (!name.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }
    if (skills.length === 0) {
      setSaveError("Please select at least one skill.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const updatePayload = {
        name: name.trim(),
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim(),
        role,
        skills,
        interests,
        looking_for: lookingFor,
        experience_level: experienceLevel,
        availability,
        github_url: githubUrl.trim() || null,
        github_skills: githubSkills,
        github_topics: githubTopics,
        github_synced_at: githubSyncedAt,
        discord_username: discordUsername.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("user_id", user.id);

      if (
        error &&
        (error.message?.includes("github_skills") ||
          error.code === "PGRST204" ||
          error.code === "42703")
      ) {
        const { github_skills, github_topics, github_synced_at, ...safePayload } = updatePayload;
        ({ error } = await supabase
          .from("profiles")
          .update(safePayload)
          .eq("user_id", user.id));
      }

      if (error) {
        console.error("Profile update failed:", error.message);
        setSaveError("Could not save changes. Please try again.");
        return;
      }
      window.location.reload();
    } catch (err) {
      console.error("Profile update crashed:", err.message);
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-6 rounded-3xl border border-hairline bg-surface p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <Avatar src={avatarUrl.trim()} name={name} size={64} />
        <div className="flex-1">
          <label htmlFor="avatar" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Profile image URL
          </label>
          <input
            id="avatar"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full resize-none rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Primary role *</p>
        <OptionSelect options={ROLES} value={role} onChange={setRole} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Skills *</p>
        <ChipSelect options={SKILLS} selected={skills} onChange={setSkills} allowCustom />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Interests</p>
        <ChipSelect options={INTERESTS} selected={interests} onChange={setInterests} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Experience level</p>
        <OptionSelect options={EXPERIENCE_LEVELS} value={experienceLevel} onChange={setExperienceLevel} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Looking for</p>
        <ChipSelect options={LOOKING_FOR} selected={lookingFor} onChange={setLookingFor} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Availability</p>
        <OptionSelect options={AVAILABILITY_OPTIONS} value={availability} onChange={setAvailability} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="github" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            GitHub link
          </label>
          <input
            id="github"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/you"
            className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
          <div className="mt-2">
            <Button
              type="button"
              variant="secondary"
              loading={githubSyncing}
              onClick={async () => {
                setGithubSyncErr(null);
                setGithubSyncMsg(null);
                const username = extractGithubUsername(githubUrl);
                if (!username) {
                  setGithubSyncErr("Add your GitHub link (or username) first.");
                  return;
                }
                setGithubSyncing(true);
                try {
                  const res = await fetch("/api/github/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Sync failed.");
                  setGithubSkills(data.languages);
                  setGithubTopics(data.topics);
                  setGithubSyncedAt(data.syncedAt);
                  setGithubSyncMsg(
                    data.languages.length > 0
                      ? `Verified ${data.publicRepos} repos - top languages: ${data.languages.join(", ")}`
                      : `No original repos found for ${data.login} yet.`
                  );
                } catch (err) {
                  setGithubSyncErr(err.message);
                } finally {
                  setGithubSyncing(false);
                }
              }}
            >
              Sync from GitHub
            </Button>
            {githubSyncMsg && (
              <p className="mt-1.5 text-xs text-emerald-300">{githubSyncMsg}</p>
            )}
            {githubSyncErr && (
              <p className="mt-1.5 text-xs text-rose-300">{githubSyncErr}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="discord" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Discord username
          </label>
          <input
            id="discord"
            type="text"
            value={discordUsername}
            onChange={(e) => setDiscordUsername(e.target.value)}
            placeholder="you#1234 or @you"
            className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {saveError && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {saveError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
