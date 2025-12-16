{ pkgs }: {
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_20
  ];
  idx.workspace = {
    onCreate = {
      npm-install = "npm install";
    };
    onStart = {
      npm-run-dev = "npm run dev";
    };
  };
}
