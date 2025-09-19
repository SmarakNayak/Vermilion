import { Effect } from "effect";
import { Atom, Result } from "@effect-atom/atom-react";
import { RustClientService, rustClientRuntime } from "./rustAtoms";

export const gallerySummaryAtomFamily = Atom.family((galleryId: string | undefined) =>
  rustClientRuntime.atom((get) => {
    if (!galleryId) return Effect.die("No inscription ID provided");
    return Effect.gen(function* () {
      const rustClient = yield* RustClientService;
      return yield* rustClient["GET/gallery_summary/{gallery_id}"](galleryId);
    }).pipe(
      Effect.catchAll((error) => Effect.die(error))
    );
  })
);

export const inscriptionMetadataAtomFamily = Atom.family((inscriptionId: string | undefined) => 
  rustClientRuntime.atom((get) => {
    if (!inscriptionId) return Effect.die("No inscription ID provided");
    return Effect.gen(function* () {
      const rustClient = yield* RustClientService;
      return yield* rustClient["GET/inscription_metadata/{inscription_id}"](inscriptionId);
    }).pipe(
      Effect.catchAll((error) => Effect.die(error))
    );
  })
);

export const inscriptionMetadataNumberAtomFamily = Atom.family((number: string | undefined) =>
  rustClientRuntime.atom((get) => {
    if (!number) return Effect.die("No inscription number provided");
    return Effect.gen(function* () {
      const rustClient = yield* RustClientService;
      return yield* rustClient["GET/inscription_metadata_number/{number}"](number);
    }).pipe(
      Effect.catchAll((error) => Effect.die(error))
    );
  })
);