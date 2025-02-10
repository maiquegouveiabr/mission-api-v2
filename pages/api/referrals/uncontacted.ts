import { Referral } from "@/interfaces";
import fetchData from "@/util/api/fetchData";
import { NextApiRequest, NextApiResponse } from "next";

const BOA_VISTA_COLOMBO = 500387154;
const PONTA_GROSSA_CAMPOS_GERAIS = 500427238;
const TARUMÃ_PINHAIS = 500427239;
const IGUAÇU_CAMPO_COMPRIDO = 500483702;
const SÃO_LOURENÇO_CURITIBA = 500393700;
const PONTA_GROSSA_NORTE = 500251576;
const APS = 500625797;

export default async function Uncontacted(req: NextApiRequest, res: NextApiResponse) {
  const { refreshToken } = req.query;
  if (!refreshToken) {
    res.status(400).json({
      at: "api/referrals/uncontacted",
      message: "refreshToken was not provided",
    });
  } else {
    const data = await fetchData("https://referralmanager.churchofjesuschrist.org/services/people/mission/14319", String(refreshToken));
    if (!data) {
      res.status(500).json({
        at: "api/referrals/uncontacted.ts",
        func: "fetchData",
        message: "INTERNAL_SERVER_ERROR",
      });
    } else {
      const referrals: Referral[] = data.persons;
      const filteredReferrals = referrals.filter(
        (ref) => ref.zoneId !== APS && (ref.referralStatusId === 20 || ref.referralStatusId === 10) && ref.personStatusId !== 40
      );
      res.status(200).send(filteredReferrals);
    }
  }
}
