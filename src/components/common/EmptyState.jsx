import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Empty className="bg-tint-soft py-16">
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant="icon" className="bg-background text-primary-soft">
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle className="text-lg font-semibold text-foreground">{title}</EmptyTitle>
        {description && <EmptyDescription className="text-[15px]">{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
