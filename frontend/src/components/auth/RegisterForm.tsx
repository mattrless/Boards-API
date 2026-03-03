import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
  return (
    <form className="w-full" onSubmit={(e) => e.preventDefault()}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="register-name">Full name</FieldLabel>
          <Input
            id="register-name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            type="email"
            placeholder="john.doe@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            type="password"
            placeholder="strongPassword123"
            autoComplete="new-password"
            minLength={4}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-confirm-password">
            Confirm password
          </FieldLabel>
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            minLength={4}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="register-avatar">Avatar URL (optional)</FieldLabel>
          <Input
            id="register-avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            autoComplete="url"
          />
        </Field>

        <Button type="submit" className="w-full">
          Create account
        </Button>
      </FieldGroup>
    </form>
  );
}
