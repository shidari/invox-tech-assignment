import { $ } from "zx";

const endpoint = "https://image-classification-api.sho-lab.workers.dev";

const ary: unknown[] = [];
const limit = 100;
for (let i = 0; i < limit; i++) {
  const url = (
    await $`curl -Ls -o /dev/null -w '%{url_effective}\n' https://picsum.photos/200/300`
  ).stdout.trim();
  const res = await fetch(`${endpoint}/api/classification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_path: url,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to classify image: ${res.status} ${await res.text()}`,
    );
  }
  const data = await res.json();
  console.log(`success ${i + 1}/${limit}: image_path=${url}`);
  ary.push(data);
  await $`sleep 0.5`;
}

console.log(`Inserted ${ary.length} records`);
