import { Tabs, TabsContent, TabsList, TabsTrigger } from "@travelese/ui/tabs";

import FlightsSearchForm from "@/components/travel/flights/flights-search-form";
import StaysSearchForm from "@/components/travel/stays/stays-search-form";
import { HotelIcon, PlaneTakeoffIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 sm:py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-muted-foreground">
                  Travelese
                </h1>
              </div>
              <div className="mx-auto max-w-6xl">
                <Tabs
                  defaultValue="fly"
                  className="rounded-lg border shadow-sm"
                >
                  <TabsList className="grid w-full grid-cols-2 divide-x">
                    <TabsTrigger value="fly" className="w-full">
                      <PlaneTakeoffIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      Fly
                    </TabsTrigger>
                    <TabsTrigger value="stay" className="w-full">
                      <HotelIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      Stay
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="fly" className="overflow-hidden">
                    <FlightsSearchForm />
                  </TabsContent>
                  <TabsContent value="stay">
                    <StaysSearchForm />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
