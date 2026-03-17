"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BoardDetailsResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import GeneralBoardSettingsTab from "./GeneralBoardSettingsTab";
import BoardMembersSettingsTab from "./BoardMembersSettingsTab";

type BoardSettingsDialogProps = {
  board: BoardDetailsResponseDto;
  disabled?: boolean;
};

export default function BoardSettingsDialog({
  board,
  disabled = false,
}: BoardSettingsDialogProps) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-label="Board settings"
                disabled={disabled}
                className="w-full sm:w-auto"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent side="right">Board settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-h-[85vh] overflow-hidden p-4 sm:max-w-4xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="truncate">{board.name} settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="tab-general" className="min-h-0 gap-4">
          <div className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:inline-flex sm:h-9 sm:w-fit">
              <TabsTrigger
                value="tab-general"
                className="min-w-0 px-3 py-2 text-xs sm:text-sm"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="tab-members"
                className="min-w-0 px-3 py-2 text-xs sm:text-sm"
              >
                Members
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="tab-general"
            className="max-h-[calc(85vh-12rem)] overflow-y-auto pr-1"
          >
            <GeneralBoardSettingsTab board={board} />
          </TabsContent>
          <TabsContent
            value="tab-members"
            className="max-h-[calc(85vh-12rem)] overflow-y-auto pr-1"
          >
            <BoardMembersSettingsTab board={board} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
