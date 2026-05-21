defmodule SyncFlow.Core.Cldr do
  use Cldr,
    locales: ["en", "fr"],
    default_locale: "en",
    providers: [Cldr.Number, Money]
end
