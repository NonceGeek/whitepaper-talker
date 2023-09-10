const url = "https://api.embedbase.xyz";
const vaultId = "aptos-whitepaper-handled";
const apiKey = process.env.NEXT_PUBLIC_EMBEDBASE_API_KEY;
const do_search = async (query: string) => {
    return fetch(url + "/v1/" + vaultId + "/search", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: query
        })
    }).then(response => response.json());
};


export default async function search(question: string) {
    const searchResponse = await do_search(question);
    return searchResponse
}