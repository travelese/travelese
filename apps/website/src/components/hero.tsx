import { Button } from "@travelese/ui/button";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { Suspense } from "react";
import Cobe from "./cobe";
import { ErrorFallback } from "./error-fallback";

export function Hero() {
  return (
    <section className="md:mt-[250px] relative md:min-h-[375px]">
      <div className="hero-slide-up flex flex-col mt-[240px]">
        <h1 className="text-[30px] md:text-[90px] font-medium mt-6 leading-none">
          Traveller
          <br /> Experience.
        </h1>

        <p className="mt-4 md:mt-6 max-w-[600px] text-[#878787]">
          An all-in-one platform for authentic, immersive Traveller Experience.
          <br />
        </p>

        <div className="mt-8">
          <div className="flex items-center space-x-4">
            <Link href="/talk-to-us">
              <Button
                variant="outline"
                className="border border-primary h-12 px-6"
              >
                Talk to us
              </Button>
            </Link>

            <a href="https://app.travelese.ai">
              <Button className="h-12 px-5">Get Started</Button>
            </a>
          </div>
        </div>

        {/* <p className="text-xs text-[#707070] mt-8 font-mono">
          Used by over{" "}
          <Link href="/open-startup" prefetch>
            <span className="underline">7,800+</span>
          </Link>{" "}
          businesses.
        </p> */}
      </div>

      <div className="scale-50 lg:scale-[0.50] xl:scale-100 -top-[500px] -right-[380px] pointer-events-none transform-gpu grayscale sm:flex xl:flex lg:animate-[open-scale-up-fade_1.5s_ease-in-out] absolute md:-right-[200px] xl:-right-[100px] w-auto h-auto md:-top-[200px]">
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense>
            <Cobe />
          </Suspense>
        </ErrorBoundary>
      </div>
    </section>
  );
}
