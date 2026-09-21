import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { z } from "zod";
import IconInput from "@/components/common/IconInput";
import SimpleSelect from "@/components/common/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { facilitiesCatalog } from "@/data/mockData";
import { Users } from "lucide-react";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Under maintenance" },
];

function buildSchema(otherNames) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Enter a room name.")
      .refine((v) => !otherNames.includes(v.toLowerCase()), "Another room already uses this name."),
    floor: z.string().trim().min(2, "Enter the floor or location."),
    capacity: z
      .string()
      .regex(/^\d+$/, "Enter a whole number.")
      .refine((v) => Number(v) >= 1 && Number(v) <= 100, "Capacity must be between 1 and 100."),
    status: z.enum(["available", "occupied", "maintenance"]),
    description: z.string().trim().max(400, "Keep the description under 400 characters."),
    image: z.string().trim().refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Enter a full image URL, or leave empty."),
    facilities: z.array(z.string()),
  });
}

function RoomFormBody({ room, rooms, onSubmit, onCancel }) {
  const otherNames = useMemo(
    () => rooms.filter((r) => r.id !== room?.id).map((r) => r.name.toLowerCase()),
    [rooms, room]
  );
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(buildSchema(otherNames)),
    mode: "onTouched",
    defaultValues: {
      name: room?.name ?? "",
      floor: room?.floor ?? "",
      capacity: String(room?.capacity ?? 6),
      status: room?.status ?? "available",
      description: room?.description ?? "",
      image: room?.image ?? "",
      facilities: room?.facilities ?? [],
    },
  });

  const submit = (v) =>
    onSubmit({
      name: v.name.trim(),
      floor: v.floor.trim(),
      capacity: Number(v.capacity),
      status: v.status,
      description: v.description.trim(),
      facilities: v.facilities,
      // Empty keeps the existing photo when editing, or the store default when adding.
      ...(v.image.trim() ? { image: v.image.trim() } : {}),
    });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-6">
      <FieldGroup className="gap-6">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="room-name">Room name</FieldLabel>
              <Input {...field} id="room-name" placeholder="e.g. Meridian" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="floor"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="room-floor">Floor and wing</FieldLabel>
              <Input {...field} id="room-floor" placeholder="e.g. Floor 8, West Wing" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="capacity"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="room-capacity">Capacity</FieldLabel>
              <IconInput {...field} id="room-capacity" type="number" min={1} icon={Users} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="room-status">Status</FieldLabel>
              <SimpleSelect id="room-status" value={field.value} onValueChange={field.onChange} options={statusOptions} />
            </Field>
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="room-description">Description</FieldLabel>
              <Textarea {...field} id="room-description" rows={3} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="image"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="room-image">Photo URL (optional)</FieldLabel>
              <Input {...field} id="room-image" type="url" placeholder="https://…" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="facilities"
          control={control}
          render={({ field }) => (
            <FieldSet>
              <FieldLegend variant="label">Facilities</FieldLegend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {facilitiesCatalog.map((f) => {
                  const id = `facility-${f.replace(/\s+/g, "-").toLowerCase()}`;
                  return (
                    <div key={f} className="flex items-center gap-3">
                      <Checkbox
                        id={id}
                        checked={field.value.includes(f)}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? [...field.value, f] : field.value.filter((x) => x !== f))
                        }
                      />
                      <Label htmlFor={id} className="font-medium text-foreground/80">
                        {f}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </FieldSet>
          )}
        />
      </FieldGroup>

      <DialogFooter className="-mx-6 -mb-6 mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{room ? "Save changes" : "Add room"}</Button>
      </DialogFooter>
    </form>
  );
}

// room = null adds a new room; a room object edits it.
export default function RoomFormDialog({ open, onOpenChange, room, rooms, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{room ? `Edit ${room.name}` : "Add a room"}</DialogTitle>
          <DialogDescription>
            {room ? "Changes apply immediately across the employee and admin views." : "New rooms appear in Find a room straight away."}
          </DialogDescription>
        </DialogHeader>
        <RoomFormBody room={room} rooms={rooms} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
