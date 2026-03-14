import { Sparkles } from "lucide-react";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAiControllerGenerateDescription } from "@/lib/api/generated/ai/ai";
import { toast } from "sonner";

type GenerateDescriptionButtonProps = {
  title: string;
  onGenerateDescription?: (description: string) => void;
  disabled?: boolean;
};

export default function GenerateDescriptionButton({
  title,
  onGenerateDescription,
  disabled = false,
}: GenerateDescriptionButtonProps) {
  const aiGenerateDescriptionMutation = useAiControllerGenerateDescription();

  function handleGenerateDescription() {
    aiGenerateDescriptionMutation.mutate(
      { data: { title } },
      {
        onSuccess: (response) => {
          if (response.status === 400) {
            toast.error("Title is needed");
          }
          if (response.status !== 200) {
            return;
          }
          toast.success("Description generated.");
          onGenerateDescription?.(response.data.description);
        },
        onError: () => {
          toast.error("Something went wrong.");
        },
      },
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="group relative inline-flex rounded-md p-px">
          <div className="absolute inset-0 rounded-md bg-[linear-gradient(90deg,#ff6b6b,#f7b733,#6aff8a,#4d9cff,#a855f7,#ff6b6b)] bg-size-[200%_200%] bg-position-[0%_50%] transition-[background-position] duration-700 group-hover:bg-position-[100%_50%]" />
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Generate description from title"
              disabled={disabled || aiGenerateDescriptionMutation.isPending}
              onClick={handleGenerateDescription}
              className="relative z-10 rounded-[calc(var(--radius)-1px)] bg-background/80 text-foreground hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <Sparkles className="size-4" />
              <span>Generate</span>
            </Button>
          </TooltipTrigger>
        </div>
        <TooltipContent side="top">Generate description</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
