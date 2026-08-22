"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import ChipSelect, { OptionSelect } from "@/components/ChipSelect";
import Avatar from "@/components/Avatar";
import {
  ROLES,
  SKILLS,
  INTERESTS,
  LOOKING_FOR,
  EXPERIENCE_LEVELS,
  AVAILABILITY_OPTIONS,
} from "@/lib/constants";

// Mounted only after auth resolves, so initial values are set once via props.
export default function OnboardingForm({ user, existingProfile }) {
  const router = useRouter();
  const p = existingProfile;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [name, setName] = useState(p?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(p?.avatar_url || "");
  const [bio, setBio] = useState(p?.bio || "");
  const [role, setRole] = useState(p?.role || "");
  const [skills, setSkills] = useState(p?.skills || []);
  const [interests, setInterests] = useState(p?.interests || []);
  const [lookingFor, setLookingFor] = useState(p?.looking_for || []);
  const [experienceLevel, setExperienceLevel] = useState(p?.experience_level || "");
  const [availability, setAvailability] = useState(p?.availability || "");
  const [githubUrl, setGithubUrl] = useState(p?.github_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(p?.linkedin_url || "");
  const [discordUsername, setDiscordUsername] = useState(p?.discord_username || "");

  const [fieldErrors, setFieldErrors] = useState({});

  const TOTAL_STEPS = 5;

  function validateStep(current) {
    const errors = {};
    if (current === 1) {
      if (!name.trim()) errors.name = "Please enter your name.";
      if (!role) errors.role = "Please choose your primary role.";
    }
    if (current === 2 && skills.length === 0) {
      errors.skills = "Select at least one skill.";
    }
    if (current === 3 && interests.length === 0) {
      errors.interests = "Select at least one interest.";
    }
    if (current === 4) {
      if (!experienceLevel) errors.experienceLevel = "Choose your experience level.";
      if (lookingFor.length === 0)
        errors.lookingFor = "Select at least one thing you're looking for.";
    }
    if (current === 5 && !availability) {
      errors.availability = "Choose your availability.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setFieldErrors({});
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function back() {
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSave() {
    if (!validateStep(5)) return;
    setSaving(true);
    setSaveError(null);

    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();

      const payload = {
        user_id: user.id,
        name: name.trim(),
        username: user.email
          ? user.email.split("@")[0]
          : name.toLowerCase().replace(/\s+/g, ""),
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim(),
        role,
        skills,
        interests,
        looking_for: lookingFor,
        experience_level: experienceLevel,
        availability,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        discord_username: discordUsername.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let dbError;
      if (p) {
        ({ error: dbError } = await supabase
          .from("profiles")
          .update(payload)
          .eq("user_id", user.id));
      } else {
        ({ error: dbError } = await supabase.from("profiles").insert(payload));
      }

      if (dbError) {
        console.error("Profile save failed:", dbError.message);
        setSaveError("Could not save your profile. Please try again.");
        return;
      }

      router.replace("/discover");
    } catch (err) {
      console.error("Profile save crashed:", err.message);
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8">
      {/* Progress */}
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
        <span>
          Step {step} of {TOTAL_STEPS}
        </span>
        <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <section className="animate-fade-up space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold">Basic information</h1>
            <p className="mt-1 text-sm text-muted">Tell people who you are.</p>
          </div>

          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl.trim()} name={name || "You"} size={64} />
            <div className="flex-1">
              <label htmlFor="avatar" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Profile image URL <span className="normal-case">(optional)</span>
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
              placeholder="Your name"
              className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs font-medium text-rose-400">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Short bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What do you build? What are you excited about?"
              className="w-full resize-none rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Primary role *
            </p>
            <OptionSelect options={ROLES} value={role} onChange={setRole} error={fieldErrors.role} />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="animate-fade-up space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold">Your skills</h1>
            <p className="mt-1 text-sm text-muted">What can you contribute to a team?</p>
          </div>
          <ChipSelect
            options={SKILLS}
            selected={skills}
            onChange={(v) => {
              setSkills(v);
              setFieldErrors((f) => ({ ...f, skills: undefined }));
            }}
            allowCustom
            error={fieldErrors.skills}
          />
        </section>
      )}

      {step === 3 && (
        <section className="animate-fade-up space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold">Interests</h1>
            <p className="mt-1 text-sm text-muted">What domains do you want to build in?</p>
          </div>
          <ChipSelect
            options={INTERESTS}
            selected={interests}
            onChange={(v) => {
              setInterests(v);
              setFieldErrors((f) => ({ ...f, interests: undefined }));
            }}
            error={fieldErrors.interests}
          />
        </section>
      )}

      {step === 4 && (
        <section className="animate-fade-up space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Experience & goals</h1>
            <p className="mt-1 text-sm text-muted">
              Where are you now, and what do you need?
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Experience level *
            </p>
            <OptionSelect
              options={EXPERIENCE_LEVELS}
              value={experienceLevel}
              onChange={(v) => {
                setExperienceLevel(v);
                setFieldErrors((f) => ({ ...f, experienceLevel: undefined }));
              }}
              error={fieldErrors.experienceLevel}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              What are you looking for? *
            </p>
            <ChipSelect
              options={LOOKING_FOR}
              selected={lookingFor}
              onChange={(v) => {
                setLookingFor(v);
                setFieldErrors((f) => ({ ...f, lookingFor: undefined }));
              }}
              error={fieldErrors.lookingFor}
            />
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="animate-fade-up space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Availability</h1>
            <p className="mt-1 text-sm text-muted">When can you work with teammates?</p>
          </div>
          <OptionSelect
            options={AVAILABILITY_OPTIONS}
            value={availability}
            onChange={(v) => {
              setAvailability(v);
              setFieldErrors((f) => ({ ...f, availability: undefined }));
            }}
            error={fieldErrors.availability}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="github" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                GitHub link <span className="normal-case">(optional)</span>
              </label>
              <input
                id="github"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/you"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="discord" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Discord username <span className="normal-case">(optional)</span>
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
            <div>
              <label htmlFor="linkedin" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                LinkedIn link <span className="normal-case">(optional)</span>
              </label>
              <input
                id="linkedin"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/you"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </section>
      )}

      {saveError && (
        <p className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {saveError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={step === 1 || saving}>
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={handleSave} loading={saving}>
            Finish & start discovering
          </Button>
        )}
      </div>
    </div>
  );
}
