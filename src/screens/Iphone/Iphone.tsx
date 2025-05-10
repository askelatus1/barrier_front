import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export const Iphone = (): JSX.Element => {
  return (
    <div className="relative w-full max-w-[393px] h-[852px] bg-[#232325] mx-auto">
      <header className="w-full h-[51px] bg-[#232325] flex items-center px-1">
        <img
          className="w-[42px] h-[42px] object-cover"
          alt="Game logo"
          src="/image-1.png"
        />
        <span className="ml-[6px] font-normal text-[#ffd988] text-xs">
          BARRIER GAME
        </span>
        <div className="ml-auto">
          <Button
            variant="ghost"
            className="w-[22px] h-[22px] bg-[#424242] rounded-[11px] p-0 flex items-center justify-center"
          >
            <span className="text-[#d9c48d] text-[15px]">?</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-col w-full">
        <Card className="w-full h-[398px] rounded-none border-[#1a1a1a]">
          <CardContent className="p-0">
            <div className="w-full h-full bg-[#333333]"></div>
          </CardContent>
        </Card>

        <div className="flex w-full h-[403px]">
          <Card className="w-[199px] h-full rounded-none border-[#151515]">
            <CardContent className="p-0">
              <div className="w-full h-full bg-[#2a2a2a]"></div>
            </CardContent>
          </Card>

          <Card className="w-[194px] h-full rounded-none border-[#1f1f1f]">
            <CardContent className="p-0">
              <div className="w-full h-full bg-[#3d3d3d]"></div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};